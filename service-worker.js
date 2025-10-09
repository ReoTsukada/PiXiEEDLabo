const CACHE_VERSION = 'pixieedraw-static-v10';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/pwa.js',
  './assets/icons/menu-canvas.png',
  './assets/icons/tool-cursor.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './ogp.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then(response => {
          const shouldCache = response && response.status === 200 && response.type === 'basic';
          if (shouldCache) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
