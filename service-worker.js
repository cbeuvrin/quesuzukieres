/* ==========================================================
   Service Worker — PWA offline
   - Cachea todos los assets en el primer load
   - Permite funcionar 100% sin internet en el evento
   - Cambia CACHE_VERSION cuando actualices algo para forzar refresh
   ========================================================== */

const CACHE_VERSION = 'suzuki-quiz-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './css/styles.css',
  './css/admin.css',
  './js/app.js',
  './js/admin.js',
  './js/storage.js',
  './js/quiz-data.js',
  './js/supabase-config.js',
  './assets/logo-suzuki.png',
  './assets/swift-booster-green-amarillo-ocaso.png',
  './assets/DZIRE-BOOSTERGREEN-2026.png',
  './assets/JIMNY-5-DOOR-2026.png'
];

// Install: pre-cachea todo lo del core
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: limpia caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para los assets propios, network-first para Supabase
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // No interceptes peticiones a Supabase o fonts dinámicas
  if (url.origin !== self.location.origin) {
    // Para Google Fonts: stale-while-revalidate (intenta red, sirve cache si falla)
    if (url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.open(CACHE_VERSION).then(async cache => {
          const cached = await cache.match(req);
          const fetched = fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetched;
        })
      );
    }
    return; // dejar pasar lo demás (ej. Supabase)
  }

  // Cache-first para nuestros assets
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok && req.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
