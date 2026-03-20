import { precacheAndRoute } from 'workbox-precaching';

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'YORMIT', body: event.data.text() };
  }

  const { title = 'YORMIT', body = '', icon = '/pwa-icon-192.png', data = {} } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/pwa-icon-192.png',
      data,
      vibrate: [100, 50, 100],
      tag: data.url || 'yormit-default',
      renotify: true,
    })
  );
});

// Notification click → deep link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if found
      for (const client of windowClients) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(fullUrl);
    })
  );
});
