import webpush, { type PushSubscription } from "web-push";
import { env } from "~/env";

// Configure web-push
webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type: "announcement" | "event" | "tryout" | "scholarship" | "job" | "course";
  tag?: string;
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
}

export async function sendNotificationToMultiple(
  subscriptions: PushSubscription[],
  payload: NotificationPayload,
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendNotification(sub, payload)),
  );

  return results.map((result, index) => ({
    subscription: subscriptions[index],
    success: result.status === "fulfilled" && result.value.success,
    error: result.status === "rejected" ? result.reason as string : undefined,
  }));
}
