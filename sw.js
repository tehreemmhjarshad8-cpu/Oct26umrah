/*
  Service worker: keeps the app working offline (handy with patchy data in Makkah and Madinah).
  Pages and data are fetched fresh when online and fall back to the saved copy when offline.
  Bump CACHE_VERSION whenever you publish changes.
*/
const CACHE_VERSION = 'oct26-v2';
const FONT_CACHE = 'oct26-fonts';
const NETWORK_TIMEOUT_MS = 4000;

const APP_SHELL = [
  './',
  './index.html',
  './assets/css/app.css',
  './assets/js/data.js',
  './assets/js/prayer.js',
  './assets/js/app.js',
  './manifest.webmanifest',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
  }
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const network = fetch(request).then((response) => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  });
  network.catch(() => {});
  const fallback = async () => {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    if (request.mode === 'navigate') return cache.match('./index.html');
    return undefined;
  };
  try {
    const first = await Promise.race([network, delay(NETWORK_TIMEOUT_MS).then(() => null)]);
    if (first) return first;
    return (await fallback()) || (await network);
  } catch (err) {
    const hit = await fallback();
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
  return response;
}
