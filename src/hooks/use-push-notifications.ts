import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BF6_ks6NNrDUWd2IlI-26h--3M7oMJ7SSxlV8JXv6dARx25wBfL-CglKAn9xh9uCbjLTJb_ZFoepMzfHJKE59C4";
const PUSH_SYNC_EVENT = "push-subscription-changed";

export type PushSupportState = "supported" | "install-required" | "unavailable";

type SubscribeResult = {
  success: boolean;
  error?: string;
};

function detectPushSupport(): PushSupportState {
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasNotification = "Notification" in window;
  const hasPushManager =
    "PushManager" in window ||
    ("ServiceWorkerRegistration" in window && "pushManager" in ServiceWorkerRegistration.prototype);
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (window.isSecureContext && hasServiceWorker && hasNotification && hasPushManager) {
    return "supported";
  }

  if (window.isSecureContext && isIOS && hasServiceWorker && hasNotification && !isStandalone) {
    return "install-required";
  }

  return "unavailable";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getReadablePushError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "No se concedió el permiso de notificaciones. Revísalo en los ajustes del navegador o del sistema.";
    }
    if (error.name === "AbortError") {
      return "La activación de notificaciones se canceló antes de completarse. Inténtalo otra vez.";
    }
    if (error.name === "InvalidStateError") {
      return "El service worker aún no está listo para registrar notificaciones. Cierra y vuelve a abrir YORMIT.";
    }
    if (error.name === "NotSupportedError") {
      return "Este dispositivo o navegador no permite suscripciones push en este contexto.";
    }
  }

  if (error && typeof error === "object" && "message" in error && typeof (error as { message?: string }).message === "string") {
    return (error as { message: string }).message;
  }

  return "No se pudo activar las notificaciones push. Inténtalo de nuevo.";
}

function emitPushSubscriptionChanged() {
  window.dispatchEvent(new Event(PUSH_SYNC_EVENT));
}

export function usePushNotifications() {
  const [supportState, setSupportState] = useState<PushSupportState>("unavailable");
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const syncSubscriptionState = useCallback(async () => {
    const nextSupportState = detectPushSupport();
    setSupportState(nextSupportState);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    if (nextSupportState !== "supported") {
      setIsSubscribed(false);
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      console.info("[Push] serviceWorker.ready resolved during sync");
      const localSub = await reg.pushManager.getSubscription();
      console.info("[Push] Existing local subscription during sync:", !!localSub);

      if (!localSub) {
        setIsSubscribed(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("[Push] No authenticated user during sync");
        setIsSubscribed(false);
        return;
      }

      const { data: dbSubs, error: dbError } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", user.id)
        .eq("endpoint", localSub.endpoint)
        .limit(1);

      if (dbError) {
        console.error("[Push] Error checking DB subscription sync:", dbError);
        setIsSubscribed(false);
        return;
      }

      if (dbSubs && dbSubs.length > 0) {
        setIsSubscribed(true);
        setLastError(null);
      } else {
        console.warn("[Push] Desync detected: local subscription exists but not in DB. Cleaning up local only.");
        await localSub.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.warn("[Push] Sync check failed:", error);
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    void syncSubscriptionState();

    const handleSync = () => {
      void syncSubscriptionState();
    };

    window.addEventListener(PUSH_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(PUSH_SYNC_EVENT, handleSync);
  }, [syncSubscriptionState]);

  const subscribe = useCallback(async (): Promise<SubscribeResult> => {
    setLastError(null);
    const nextSupportState = detectPushSupport();
    setSupportState(nextSupportState);

    if (nextSupportState !== "supported") {
      const error = "Este dispositivo no puede activar notificaciones push en el estado actual.";
      setIsSubscribed(false);
      setLastError(error);
      return { success: false, error };
    }

    if (!("Notification" in window)) {
      const error = "Este navegador no expone la API de notificaciones.";
      setIsSubscribed(false);
      setLastError(error);
      return { success: false, error };
    }

    try {
      const permissionBefore = Notification.permission;
      console.info("[Push] Permission before subscribe click:", permissionBefore);

      let permissionAfter = permissionBefore;
      if (permissionBefore === "default") {
        permissionAfter = await Notification.requestPermission();
        console.info("[Push] Permission after requestPermission:", permissionAfter);
      }

      setPermission(permissionAfter);

      if (permissionAfter !== "granted") {
        const error = permissionAfter === "denied"
          ? "Has bloqueado las notificaciones. Actívalas desde los ajustes del navegador o del sistema."
          : "No se concedió el permiso de notificaciones, así que no se pudo completar la activación.";
        setIsSubscribed(false);
        setLastError(error);
        emitPushSubscriptionChanged();
        return { success: false, error };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const error = "No se pudo identificar tu sesión. Cierra y vuelve a iniciar sesión antes de activar notificaciones.";
        setIsSubscribed(false);
        setLastError(error);
        return { success: false, error };
      }

      console.info("[Push] Authenticated user for subscription:", user.id);
      const reg = await navigator.serviceWorker.ready;
      console.info("[Push] serviceWorker.ready resolved after click");

      const existingSub = await reg.pushManager.getSubscription();
      console.info("[Push] Existing local subscription before subscribe:", !!existingSub);
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      console.info("[Push] pushManager.subscribe succeeded:", subscription.endpoint);
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        await subscription.unsubscribe().catch(() => undefined);
        const error = "La suscripción push se creó incompleta y se canceló. Inténtalo otra vez.";
        setIsSubscribed(false);
        setLastError(error);
        return { success: false, error };
      }

      const { error: saveError } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (saveError) {
        console.error("[Push] Error saving push subscription:", saveError);
        await subscription.unsubscribe().catch(() => undefined);
        const error = `No se pudo guardar la suscripción push: ${saveError.message}`;
        setIsSubscribed(false);
        setLastError(error);
        return { success: false, error };
      }

      const { data: persistedRows, error: verifyError } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("endpoint", json.endpoint)
        .limit(1);

      if (verifyError || !persistedRows?.length) {
        console.error("[Push] Subscription verification failed:", verifyError);
        await subscription.unsubscribe().catch(() => undefined);
        const error = "La suscripción se creó localmente, pero no quedó guardada en la base de datos.";
        setIsSubscribed(false);
        setLastError(error);
        emitPushSubscriptionChanged();
        return { success: false, error };
      }

      setIsSubscribed(true);
      setPermission(Notification.permission);
      setSupportState("supported");
      setLastError(null);
      emitPushSubscriptionChanged();
      return { success: true };
    } catch (err) {
      console.error("[Push] Subscription failed:", err);
      const error = getReadablePushError(err);
      setIsSubscribed(false);
      setSupportState(detectPushSupport());
      setPermission("Notification" in window ? Notification.permission : "default");
      setLastError(error);
      emitPushSubscriptionChanged();
      return { success: false, error };
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setIsSubscribed(false);
      setLastError(null);
      emitPushSubscriptionChanged();
      return true;
    } catch (err) {
      console.error("[Push] Unsubscription failed:", err);
      return false;
    }
  }, []);

  return {
    isSupported: supportState === "supported",
    supportState,
    permission,
    isSubscribed,
    lastError,
    subscribe,
    unsubscribe,
  };
}
