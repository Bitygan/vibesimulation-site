/**
 * Service Worker for VibeSimulation
 * Aggressive caching for low-memory devices
 */

const CACHE_NAME = 'vibesimulation-v1.0.0';
const STATIC_CACHE = 'vibesimulation-static-v1.0.0';
const DYNAMIC_CACHE = 'vibesimulation-dynamic-v1.0.0';

// Resources to cache immediately (critical path)
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/video.css',
    '/assets/css/cookie-consent.css',
    '/assets/js/device-capabilities.js',
    '/assets/js/optimized-loader.js',
    '/assets/js/vanilla-browser.js',
    '/assets/js/vanilla-breakpoints.js',
    '/assets/webfonts/fa-solid-900.woff2',
    '/favicon.ico'
];

// Resources to cache on demand (progressive loading)
const PROGRESSIVE_RESOURCES = [
    '/assets/js/vanilla-scrolly.js',
    '/assets/js/vanilla-dropotron.js',
    '/assets/js/vanilla-scrollex.js',
    '/assets/js/vanilla-utilities.js',
    '/assets/js/main.js',
    '/assets/js/video.js',
    '/assets/js/cookie-consent.js'
];

// Cache strategies based on device capabilities
let deviceCapabilities = null;

// Install event - cache critical resources
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker');

    event.waitUntil(
        Promise.all([
            // Cache critical resources
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES);
            }),

            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different request types
    if (event.request.destination === 'document') {
        // HTML documents - Network first, cache fallback
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(event.request);
                })
        );
    } else if (event.request.destination === 'script' ||
               event.request.destination === 'style' ||
               event.request.destination === 'font') {
        // Static assets - Cache first, network fallback
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        // Return cached version and update in background
                        fetch(event.request).then(networkResponse => {
                            if (networkResponse.status === 200) {
                                caches.open(STATIC_CACHE).then(cache => {
                                    cache.put(event.request, networkResponse);
                                });
                            }
                        }).catch(() => {
                            // Network failed, keep cached version
                        });

                        return response;
                    }

                    // Not in cache, fetch from network
                    return fetch(event.request).then(networkResponse => {
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(STATIC_CACHE).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    });
                })
        );
    } else if (event.request.destination === 'image') {
        // Images - Cache first with memory-aware strategy
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(networkResponse => {
                        // Only cache if response is small (< 500KB) to save memory
                        if (networkResponse.status === 200 &&
                            networkResponse.headers.get('content-length') &&
                            parseInt(networkResponse.headers.get('content-length')) < 500000) {

                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    });
                })
        );
    } else {
        // Other requests - Network first
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});

// Message event - handle device capability updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'DEVICE_CAPABILITIES') {
        deviceCapabilities = event.data.capabilities;
        console.log('[SW] Received device capabilities:', deviceCapabilities);

        // Adjust caching strategy based on device capabilities
        if (deviceCapabilities && deviceCapabilities.memory) {
            const memoryPressure = deviceCapabilities.memory.pressure;

            if (memoryPressure === 'high') {
                // Aggressive cleanup for low-memory devices
                cleanupMemory();
            }
        }
    }
});

// Memory cleanup function for low-memory devices
function cleanupMemory() {
    console.log('[SW] Running memory cleanup');

    // Remove non-critical cached items
    caches.open(DYNAMIC_CACHE).then(cache => {
        cache.keys().then(requests => {
            const toDelete = requests.filter(request => {
                const url = request.url;
                // Keep only critical resources in dynamic cache for low-memory devices
                return !CRITICAL_RESOURCES.some(critical => url.includes(critical));
            });

            console.log('[SW] Deleting', toDelete.length, 'non-critical cached items');
            toDelete.forEach(request => {
                cache.delete(request);
            });
        });
    });
}

// Periodic cleanup (reduced frequency for performance)
let cleanupCount = 0;
const cleanupInterval = setInterval(() => {
    cleanupCount++;

    // Only do full cleanup every 15 minutes, light cleanup every 5 minutes
    if (cleanupCount % 3 === 0) { // Every 15 minutes
        cleanupMemory();
    }

    // Stop periodic cleanup after 2 hours to reduce overhead
    if (cleanupCount > 24) { // 24 * 5 minutes = 2 hours
        clearInterval(cleanupInterval);
        console.log('[SW] Periodic cleanup disabled after 2 hours');
    }
}, 5 * 60 * 1000); // Every 5 minutes

// Handle background sync for low-memory devices
self.addEventListener('sync', event => {
    if (event.tag === 'memory-cleanup') {
        cleanupMemory();
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('[SW] Push received:', data);
    }
});