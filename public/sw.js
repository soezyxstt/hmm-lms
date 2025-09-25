import { precacheAndRoute } from "workbox-precaching";

// This line is the placeholder next-pwa needs to inject the precache manifest.
// Make sure this is at the top of your file.
precacheAndRoute(self.__WB_MANIFEST);

// Your existing push notification and click handling code goes below.
self.addEventListener("push", (event) => {
  // Provide default data for tests like the DevTools push button
  let data = {
    title: "Test Notification",
    body: "This is a test push message from the service worker.",
    url: "/",
  };

  // If the push event has data, try to parse it
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Push event data is not valid JSON:", e);
    }
  }

  const options = {
    body: data.body,
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: data.url, // Pass the URL for click handling
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
