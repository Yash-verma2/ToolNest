const CACHE_NAME = 'toolnest-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Ensure these files actually exist in your project folder!
  // If you don't have them yet, remove them from this list until you do.
  // './icons/icon-192.png', 
  // './icons/icon-512.png' 
];

// 1. Install: Cache files
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// 2. Activate: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Hit cache
        }
        return fetch(event.request); // Network fallback
      })
  );
});