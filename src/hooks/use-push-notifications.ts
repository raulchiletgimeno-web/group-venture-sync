import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Public VAPID key — safe to embed in frontend
const VAPID_PUBLIC_KEY = "BOzv8tvd9ZoYQIdtCIZNDabxooM0qs8_pM3_Dagw1eTIfV1rEtFUetYOAJyvxxV3hACD_wTNLy8se2-0yggt0EI";

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
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      // Check if already subscribed
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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
      setPermission(Notification.permission);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
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

  return { isSupported, permission, isSubscribed, subscribe, unsubscribe };
}
