// src/hooks/use-notifications.ts
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { env } from "~/env";

// Diagnostic helper
function getBrowserInfo() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = ua.includes('Android');
  const isChrome = ua.includes('Chrome') && !ua.includes('Edge');
  const isFirefox = ua.includes('Firefox');
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome');
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
  
  return {
    userAgent: ua,
    isIOS,
    isAndroid,
    isChrome,
    isFirefox,
    isSafari,
    isInStandaloneMode,
    isMobile: isIOS || isAndroid,
  };
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const browserInfo = getBrowserInfo();
    const hasNotification = "Notification" in window;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;
    
    const supported = hasNotification && hasServiceWorker && hasPushManager;
    
    console.group("🔔 Notification Support Check");
    console.log("Browser Info:", browserInfo);
    console.log("Notification API:", hasNotification);
    console.log("Service Worker:", hasServiceWorker);
    console.log("Push Manager:", hasPushManager);
    console.log("Overall Support:", supported);
    console.log("Current Permission:", Notification.permission);
    console.groupEnd();

    // Build debug info for UI
    let debugMsg = `Browser: ${browserInfo.isIOS ? 'iOS Safari' : browserInfo.isAndroid ? 'Android' : 'Desktop'}\n`;
    debugMsg += `Standalone: ${browserInfo.isInStandaloneMode ? 'Yes' : 'No'}\n`;
    debugMsg += `Notification API: ${hasNotification ? '✓' : '✗'}\n`;
    debugMsg += `Service Worker: ${hasServiceWorker ? '✓' : '✗'}\n`;
    debugMsg += `Push Manager: ${hasPushManager ? '✓' : '✗'}`;
    
    setDebugInfo(debugMsg);
    setIsSupported(supported);
    
    if (hasNotification) {
      setPermission(Notification.permission);
    }

    // iOS-specific warning
    if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) {
      console.warn("⚠️ iOS detected: Push notifications only work when app is added to home screen");
    }
  }, []);

  useEffect(() => {
    if (isSupported) {
      void getSubscription();
    }
  }, [isSupported]);

  const getSubscription = async () => {
    try {
      console.log("📥 Getting existing subscription...");
      const registration = await navigator.serviceWorker.ready;
      console.log("✓ Service worker ready:", registration.scope);
      
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        console.log("✓ Found existing subscription:", sub.endpoint);
        setSubscription(sub);
      } else {
        console.log("ℹ️ No existing subscription found");
      }
    } catch (error) {
      console.error("❌ Failed to get subscription:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
  };

  const requestPermission = async () => {
    const browserInfo = getBrowserInfo();
    
    console.group("🔔 Requesting Notification Permission");
    console.log("Supported:", isSupported);
    console.log("Browser:", browserInfo);
    
    if (!isSupported) {
      console.error("❌ Notifications not supported");
      console.groupEnd();
      
      let errorMsg = "Notifications are not supported in this browser";
      if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) {
        errorMsg = "On iOS, please add this app to your home screen first to enable notifications";
      }
      
      toast.error(errorMsg, { duration: 5000 });
      return false;
    }

    try {
      console.log("📝 Requesting permission...");
      const permission = await Notification.requestPermission();
      console.log("✓ Permission result:", permission);
      
      setPermission(permission);

      if (permission === "granted") {
        console.log("✓ Permission granted, subscribing...");
        await subscribe();
        console.groupEnd();
        return true;
      } else if (permission === "denied") {
        console.warn("⚠️ Permission denied by user");
        toast.error("Notification permission was denied. Please enable it in your browser settings.");
      } else {
        console.log("ℹ️ Permission dismissed");
      }
      
      console.groupEnd();
      return false;
    } catch (error) {
      console.error("❌ Permission request failed:", error);
      
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        
        toast.error(`Failed to request permission: ${error.message}`, { duration: 5000 });
      } else {
        toast.error("Failed to enable notifications");
      }
      
      console.groupEnd();
      return false;
    }
  };

  const subscribe = async () => {
    if (isLoading) {
      console.log("⏳ Already loading, skipping...");
      return;
    }
    
    setIsLoading(true);
    console.group("📝 Subscribing to Push");
    
    try {
      console.log("⏳ Waiting for service worker...");
      const registration = await navigator.serviceWorker.ready;
      console.log("✓ Service worker ready:", registration.scope);

      console.log("📝 Creating push subscription...");
      console.log("VAPID Public Key:", env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 20) + "...");
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      });

      console.log("✓ Push subscription created:", {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
      });
      
      setSubscription(subscription);

      const subscriptionData = {
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
      };

      console.log("💾 Saving subscription to server...");
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server responded with error:", response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as { success?: boolean; message?: string };
      console.log("✓ Subscription saved successfully:", result);
      console.groupEnd();
      
      toast.success("Notifications enabled successfully!");
      return subscription;
    } catch (error) {
      console.error("❌ Subscribe failed:", error);
      
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        
        toast.error(`Failed to subscribe: ${error.message}`, { duration: 5000 });
      } else {
        toast.error("Failed to enable notifications");
      }
      
      console.groupEnd();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      console.warn("⚠️ No subscription to unsubscribe from");
      return;
    }
    
    setIsLoading(true);
    console.group("🔕 Unsubscribing");

    try {
      console.log("📤 Unsubscribing from push...");
      await subscription.unsubscribe();
      console.log("✓ Push unsubscribed");
      
      console.log("💾 Removing from server...");
      const response = await fetch(
        `/api/notifications/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        console.log("✓ Removed from server");
      } else {
        console.warn("⚠️ Server removal failed:", response.status);
      }
      
      setSubscription(null);
      console.groupEnd();
      toast.success("Notifications disabled");
    } catch (error) {
      console.error("❌ Unsubscribe failed:", error);
      
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
        });
      }
      
      console.groupEnd();
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    console.log("🧪 Sending test notification...");
    
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      });

      const data = await response.json() as {
        success: boolean;
        message?: string;
      };

      if (data.success) {
        console.log("✓ Test notification sent");
        toast.success("Test notification sent!");
      } else {
        console.error("❌ Test failed:", data.message);
        toast.error(data.message ?? "Failed to send test notification");
      }
    } catch (error) {
      console.error("❌ Test notification failed:", error);
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
    debugInfo, // Expose debug info
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
