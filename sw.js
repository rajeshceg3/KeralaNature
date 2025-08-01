// Service Worker for caching static assets

const CACHE_NAME = 'kerala-beaches-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/map.js',
    '/ui.js',
    '/beaches.json',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap'
];

// Install the service worker and cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Strategy for map tiles: Cache first, then network
    if (requestUrl.hostname.endsWith('tile.openstreetmap.org')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return fetchResponse;
                });
            })
        );
    }
    // Strategy for beaches.json: Network first, then cache
    else if (requestUrl.pathname.endsWith('beaches.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
    // Strategy for all other requests: Cache first, then network
    else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request).then(fetchResponse => {
                        // For external resources like Google Fonts, just return the response without caching
                        if (!event.request.url.startsWith(self.location.origin)) {
                            return fetchResponse;
                        }
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return fetchResponse;
                    });
                })
        );
    }
});

// Update the service worker and remove old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
