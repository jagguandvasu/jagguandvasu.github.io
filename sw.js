// Public login-shell cache + Web Push receiver.
// Never cache private photos, audio, HTML or app code.

const CACHE = 'vasu-private-login-shell-v2.0.0';

const FILES = [
  './',
  './index.html',
  './style.css',
  './app-config.js',
  './auth.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Handle fetch requests
self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    new URL(event.request.url).origin !== location.origin
  ) return;

  event.respondWith(
    caches.match(event.request).then(
      cached => cached || fetch(event.request)
    )
  );
});

// Receive background push notifications
self.addEventListener('push', event => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = {
      body: event.data
        ? event.data.text()
        : 'You have a new little message.'
    };
  }

  const title = payload.title || 'A little message for you ♡';

  const options = {
    body: payload.body || 'Someone sent you a little something.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: payload.tag || 'vasu-love-notification',
    renotify: true,
    data: {
      url: payload.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || './',
    self.location.origin
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const client of windows) {
        if (
          client.url.startsWith(self.location.origin) &&
          'focus' in client
        ) {
          await client.focus();

          if ('navigate' in client && client.url !== target) {
            await client.navigate(target);
          }

          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
