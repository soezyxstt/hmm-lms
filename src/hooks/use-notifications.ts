// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const subscribeMutation = api.notification.subscribe.useMutation();
  const unsubscribeMutation = api.notification.unsubscribe.useMutation();

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (isSupported) {
      void getSubscription();
    }
  }, [isSupported]);

  const getSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Failed to get subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("Notifications are not supported in this browser");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await subscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to request permission:", error);
      toast.error("Failed to enable notifications");
      return false;
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      setSubscription(subscription);

      // Save to database
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh: btoa(
          String.fromCharCode(
            ...new Uint8Array(subscription.getKey("p256dh")!),
          ),
        ),
        auth: btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)),
        ),
      });

      toast.success("Notifications enabled successfully");
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications");
      throw error;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      await unsubscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
      });
      setSubscription(null);
      toast.success("Notifications disabled");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable notifications");
    }
  };

  return {
    isSupported,
    subscription,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscription,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
