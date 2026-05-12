/* eslint-disable no-restricted-globals */
// Ghost Peek - Service Worker para Web Push (iOS 16.4+)

const CACHE_NAME = 'ghost-peek-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
];

// Install - Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push - Handle incoming push notifications (iOS 16.4+)
self.addEventListener('push', (event) => {
  // Parse payload
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { 
      title: 'Nova Venda', 
      body: event.data ? event.data.text() : 'Você recebeu uma nova venda!' 
    };
  }

  // Clean notification options for iOS
  const title = data.title || 'Ghost Peek';
  const options = {
    body: data.body || '',
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: data.tag || `sale-${Date.now()}`,
    renotify: true,
    silent: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click - Open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clients) => {
      // Try to focus existing window
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICKED', data: event.notification.data });
          return client.focus();
        }
      }
      // Open new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync for failed requests (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-subscriptions') {
    event.waitUntil(syncSubscriptions());
  }
});

async function syncSubscriptions() {
  // Placeholder for subscription sync logic
  console.log('[SW] Syncing subscriptions...');
}
