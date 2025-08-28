// @ts-nocheck

import { precacheAndRoute } from "workbox-precaching";

// This line is the placeholder next-pwa needs to inject the precache manifest.
// Make sure this is at the top of your file.
precacheAndRoute(self.__WB_MANIFEST);

// Your existing push notification and click handling code goes below.
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: "/icon.png",
    data: {
      url: data.url,
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});