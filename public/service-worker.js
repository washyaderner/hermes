// Hermes Service Worker for PWA Offline Capability
const CACHE_VERSION = 'hermes-v2-pwa';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/history',
  '/templates',
  '/auth/login',
  '/manifest.json',
];

const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - implement network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Offline - cached data not available',
                offline: true,
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Check cache expiry
        const cachedDate = new Date(cachedResponse.headers.get('date'));
        const now = new Date();
        if (now - cachedDate < CACHE_EXPIRY_TIME) {
          return cachedResponse;
        }
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          const cacheName = STATIC_ASSETS.includes(new URL(request.url).pathname)
            ? STATIC_CACHE
            : DYNAMIC_CACHE;

          caches.open(cacheName).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('/dashboard');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for pending enhancements
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-enhancements') {
    event.waitUntil(syncPendingEnhancements());
  }
});

async function syncPendingEnhancements() {
  try {
    const cache = await caches.open(API_CACHE);
    const keys = await cache.keys();
    const pendingRequests = keys.filter((req) => req.url.includes('/api/enhance'));

    for (const request of pendingRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('[Service Worker] Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Background sync error:', error);
  }
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
