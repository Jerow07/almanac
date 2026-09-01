// Service Worker for Almanac PWA notifications on iOS and Android

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notification
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Almanac 💖', message: event.data.text() };
    }
  }

  const title = data.title || 'Recordatorio de Almanac 💖';
  const options = {
    body: data.message || 'Tienes una tarea o plan programado.',
    icon: '/calendar-heart.svg',
    badge: '/calendar-heart.svg',
    tag: data.taskId || 'almanac-reminder',
    data: data,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
