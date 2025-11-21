const CACHE_NAME = "toolnest-cache-v3";

// Files you want to pre-cache (optional)
const PRECACHE_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// -----------------------------------------
// 1. INSTALL
// -----------------------------------------
self.addEventListener("install", event => {
  console.log("[SW] Installing…");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_FILES);
    })
  );

  self.skipWaiting(); // Activate immediately
});


// -----------------------------------------
// 2. ACTIVATE
// -----------------------------------------
self.addEventListener("activate", event => {
  console.log("[SW] Activating…");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim(); // Take control immediately
});


// -----------------------------------------
// 3. FETCH (Network First, Cache Fallback)
// -----------------------------------------
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // IMPORTANT: Don't cache favicon or icons to avoid stale icons
  if (url.includes("icon-") || url.includes("favicon")) {
    return; // Skip caching for icons
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save new version to cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request);
      })
  );
});
