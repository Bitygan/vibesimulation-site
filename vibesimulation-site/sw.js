// Service Worker for VibeSimulation PWA
// Implements caching strategies for offline physics simulations

const CACHE_NAME = 'vibesimulation-v1.0.0';
const STATIC_CACHE = 'vibesimulation-static-v1.0.0';
const SIMULATION_CACHE = 'vibesimulation-simulations-v1.0.0';
const IMAGE_CACHE = 'vibesimulation-images-v1.0.0';

// Files to cache immediately on install
const STATIC_FILES = [
    '/',
    '/index.html',
    '/fire-percolation.html',
    '/drag-rangefinder.html',
    '/memristor-pathfinder.html',
    '/morphogenetic.html',
    '/assets/css/main.css',
    '/assets/css/simulation.css',
    '/manifest.json',
    '/favicon.ico'
];

// Simulation-specific files to cache
const SIMULATION_FILES = [
    '/vibe_sim_fire_percolation_sax_v_2.jsx'
];

// External libraries to cache
const EXTERNAL_LIBRARIES = [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            }),

            // Cache simulation files
            caches.open(SIMULATION_CACHE).then(cache => {
                console.log('Service Worker: Caching simulation files');
                return cache.addAll(SIMULATION_FILES);
            })
        ]).then(() => {
            console.log('Service Worker: All files cached successfully');
            return self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Cache installation failed:', error);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== SIMULATION_CACHE &&
                            cacheName !== IMAGE_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker: Activation complete');
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle different types of requests with appropriate caching strategies
    if (event.request.method !== 'GET') {
        return; // Don't cache non-GET requests
    }

    // Handle external libraries - Cache First strategy
    if (EXTERNAL_LIBRARIES.some(lib => url.href.includes(lib))) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(STATIC_CACHE).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    });
                })
                .catch(() => {
                    // Return offline fallback for critical libraries
                    return caches.match('/offline.html');
                })
        );
        return;
    }

    // Handle images - Cache First with fallback
    if (event.request.destination === 'image' ||
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(IMAGE_CACHE).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    });
                })
        );
        return;
    }

    // Handle simulation pages - Network First for updates
    if (url.pathname.includes('percolation') ||
        url.pathname.includes('drag') ||
        url.pathname.includes('memristor') ||
        url.pathname.includes('morphogenetic')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(SIMULATION_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached version if network fails
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // Return offline simulation page
                            return caches.match('/fire-percolation.html');
                        });
                })
        );
        return;
    }

    // Handle API requests - Network Only with timeout
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            Promise.race([
                fetch(event.request),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout')), 5000)
                )
            ])
            .catch(() => {
                return new Response(JSON.stringify({
                    error: 'Network unavailable',
                    offline: true
                }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Default: Stale While Revalidate for HTML, CSS, JS
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(STATIC_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });

                return response || fetchPromise;
            })
            .catch(() => {
                // Return offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/offline.html') || new Response(
                        '<html><body><h1>Offline</h1><p>The simulation is not available offline.</p></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            })
    );
});

// Handle background sync for simulation data
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');

    if (event.tag === 'simulation-data-sync') {
        event.waitUntil(syncSimulationData());
    }
});

async function syncSimulationData() {
    try {
        // Sync any queued simulation results or user progress
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('Service Worker: Sync failed:', error);
    }
}

// Handle push notifications for simulation updates
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New simulation content available!',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore Now',
                icon: '/icon-72x72.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('VibeSimulation', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/fire-percolation.html')
        );
    }
});

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PERFORMANCE_METRIC') {
        // Store performance metrics for analysis
        console.log('Service Worker: Performance metric received:', event.data);

        // Could send to analytics service
        // sendToAnalytics(event.data);
    }
});

// Error handling and reporting
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred:', event.error);

    // Report errors to monitoring service
    // reportError(event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);

    // Report unhandled rejections
    // reportError(event.reason);
});
