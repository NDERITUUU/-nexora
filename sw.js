const CACHE_NAME = 'nexora-v1';
const ASSETS = ['/', '/index.html', '/icon.svg', '/manifest.webmanifest'];

// Install: Cache the core files
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: Clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static files
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Don't cache API calls
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, res.clone());
          return res;
        });
      });
    })
  );
});