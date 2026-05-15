/* ============================================================
 * Compass service worker
 * ------------------------------------------------------------
 * Caches the app shell so Compass works offline (bedside,
 * scan rooms, basement) and launches instantly from the home
 * screen icon.
 *
 * Strategy: NETWORK-FIRST for the HTML (so a freshly-deployed
 * version is picked up when online), CACHE-FIRST for icons and
 * the manifest (rarely change, small).
 *
 * VERSIONING: bump CACHE_VERSION on every Compass release.
 * That invalidates the old cache and forces re-download of the
 * new HTML on next launch.
 *
 * NOTE: cache key uses the "compass-" prefix. Any earlier
 * "cadence-vX.Y" caches in already-installed clients will be
 * recognised as stale by the activate handler and deleted on
 * first launch after the rebrand.
 * ============================================================ */

const CACHE_VERSION = 'compass-v1.6';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './icon-180.png',
  './favicon-32.png'
];

/* ----- INSTALL: pre-cache the app shell ----- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ----- ACTIVATE: delete old caches from previous versions ----- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ----- FETCH: routing strategy ----- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === 'navigate' ||
    req.destination === 'document' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
