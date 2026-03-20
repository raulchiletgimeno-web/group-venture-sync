import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Public VAPID key — safe to embed in frontend
const VAPID_PUBLIC_KEY = "BOzv8tvd9ZoYQIdtCIZNDabxooM0qs8_pM3_Dagw1eTIfV1rEtFUetYOAJyvxxV3hACD_wTNLy8se2-0yggt0EI";

export type PushSupportState = "supported" | "install-required" | "unavailable";

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

export function usePushNotifications() {
  const [supportState, setSupportState] = useState<PushSupportState>("unavailable");
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const nextSupportState = detectPushSupport();
    setSupportState(nextSupportState);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    if (nextSupportState === "supported") {
      navigator.serviceWorker.ready
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          setIsSubscribed(!!sub);
        })
        .catch((error) => {
          console.warn("Push support check failed:", error);
          setIsSubscribed(false);
        });
    } else {
      setIsSubscribed(false);
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (detectPushSupport() !== "supported") {
      setSupportState(detectPushSupport());
      return false;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSubscription = await reg.pushManager.getSubscription();
      const subscription = existingSubscription ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const json = subscription.toJSON();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) {
        console.error("Error saving push subscription:", error);
        return false;
      }

      setIsSubscribed(true);
      setSupportState("supported");
      setPermission(Notification.permission);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setSupportState(detectPushSupport());
      setPermission(Notification.permission);
      return false;
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
      return true;
    } catch (err) {
      console.error("Push unsubscription failed:", err);
      return false;
    }
  }, []);

  return {
    isSupported: supportState === "supported",
    supportState,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
  };
}
