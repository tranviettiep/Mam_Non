const CACHE_NAME = 'san-choi-chu-cai-pwa-v3';
const SHELL_ASSETS = [
  './manifest.webmanifest',
  './icons/favicon-64.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() => {
        // Warm app HTML in background without blocking SW activation on mobile networks
        caches.open(CACHE_NAME).then((cache) => {
          for (const pageUrl of ['./San_Choi_Chu_Cai.html', './']) {
            fetch(pageUrl)
              .then((res) => {
                if (res && res.ok) {
                  cache.put(pageUrl, res.clone()).catch(() => {});
                }
              })
              .catch(() => {});
          }
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Navigation requests: Network-first, fallback to cached app HTML when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then(
              (cached) =>
                cached ||
                caches.match('./San_Choi_Chu_Cai.html') ||
                caches.match('./index.html') ||
                caches.match('./')
            )
        )
    );
    return;
  }

  // Same-origin static assets & Google Fonts: Cache-first with background refresh
  if (
    url.origin === self.location.origin ||
    url.hostname.endsWith('googleapis.com') ||
    url.hostname.endsWith('gstatic.com')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
