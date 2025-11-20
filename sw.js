const CACHE_NAME = 'toolnest-cache-v3';

self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name =>
          name !== CACHE_NAME ? caches.delete(name) : null
        )
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)          // 🔥 Always try network first
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request)) // If offline → fallback
  );
});
