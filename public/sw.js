// Service Worker per GRÀFIC PWA
const CACHE_NAME = 'grafic-v1';
const urlsToCache = [];

// Instal·lació del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // ignore
      }
      await self.skipWaiting();
    })()
  );
});

// Activació del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // ignore
      }

      try {
        await self.registration.unregister();
      } catch (e) {
        // ignore
      }

      try {
        const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        clientsList.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        // ignore
      }

      await self.clients.claim();
    })()
  );
});

// Estratègia: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
