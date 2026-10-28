/* مَدرَس PWA — service worker: cache-first, offline-ready.
   Cache name carries the app version; bump it on every release. */
var CACHE_NAME = 'madres-pwa-2-6-1';
var PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'logo.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function(hit) {
      if (hit) return hit;
      return fetch(event.request).then(function(res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
        return res;
      }).catch(function() { return caches.match('index.html'); });
    })
  );
});
