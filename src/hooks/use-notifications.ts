// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { env } from "~/env";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

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
    if (isLoading) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      });

      setSubscription(subscription);

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!),
            ),
          ),
          auth: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("auth")!),
            ),
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      toast.success("Notifications enabled successfully");
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;
    setIsLoading(true);

    try {
      await subscription.unsubscribe();
      await fetch(
        `/api/notifications/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
        {
          method: "DELETE",
        },
      );
      setSubscription(null);
      toast.success("Notifications disabled");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        toast.success("Test notification sent!");
      } else {
        toast.error(data.message ?? "Failed to send test notification");
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
      toast.error("Failed to send test notification");
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
    isLoading,
    setIsLoading,
    testNotification,
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
