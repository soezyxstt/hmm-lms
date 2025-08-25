// src/lib/sendPush.ts
import webPush from "web-push";
import { db } from "~/server/db";

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webPush.setVapidDetails(
    "mailto:admin@yourdomain.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export async function sendPushNotification(
  userId: string | null,
  payload: { title: string; body: string; url?: string },
) {
  const where = userId ? { userId } : {};
  const subs = await db.pushSubscription.findMany({ where });

  const notifications = subs.map((sub) =>
    webPush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: "/icons/icon-192x192.png",
        data: { url: payload.url },
      }),
    ),
  );

  await Promise.allSettled(notifications);
}
