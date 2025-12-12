// JobLens Service Worker
const CACHE_NAME = 'joblens-v1.3';
const STATIC_CACHE = 'joblens-static-v1.3';
const DYNAMIC_CACHE = 'joblens-dynamic-v1.3';

// Files to cache immediately
const STATIC_FILES = [
    './',
    './index.html',
    './pages/questionnaire.html',
    './pages/results.html',
    './pages/dashboard.html',
    './pages/about.html',
    './css/base.css',
    './css/landing.css',
    './css/questionnaire.css',
    './css/results.css',
    './css/dashboard.css',
    './css/about.css',
    './js/questionnaire.js',
    './js/results.js',
    './js/dashboard.js',
    './js/theme.js',
    './js/job-api.js',
    './js/ai-buddy.js',
    './js/network-status.js',
    './js/pwa-install.js',
    './assets/logo.jpeg',
    './assets/jobs.json',
    './manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle API requests differently
    if (url.hostname === 'api.adzuna.com') {
        event.respondWith(handleApiRequest(request));
        return;
    }
    
    // Handle static files
    event.respondWith(
        handleStaticRequest(request)
    );
});

// Handle static file requests
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Try network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('📡 Request failed, trying fallbacks...', request.url);
        
        // For navigation requests, return index.html
        if (request.mode === 'navigate') {
            const indexResponse = await caches.match('./index.html') || await caches.match('./');
            if (indexResponse) {
                return indexResponse;
            }
        }
        
        // For other requests, return appropriate offline response
        if (request.destination === 'image') {
            // Return a placeholder for images
            return new Response('', { status: 204, statusText: 'No Content' });
        }
        
        // Return offline JSON response
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'You are currently offline. Please check your internet connection.'
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle API requests with caching strategy
async function handleApiRequest(request) {
    const cacheKey = `api-${request.url}`;
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(cacheKey, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('📡 API request failed, trying cache...');
        
        // Fallback to cache
        const cachedResponse = await caches.match(cacheKey);
        if (cachedResponse) {
            console.log('📦 Serving API response from cache');
            return cachedResponse;
        }
        
        // Return offline response
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'Unable to fetch jobs. You are currently offline.',
                results: []
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Background sync for saving jobs when offline
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'save-job') {
        event.waitUntil(syncSavedJobs());
    }
});

// Sync saved jobs when back online
async function syncSavedJobs() {
    try {
        // Get pending saves from IndexedDB or localStorage
        const pendingSaves = await getPendingSaves();
        
        for (const save of pendingSaves) {
            // Process each pending save
            await processSave(save);
        }
        
        console.log('✅ Saved jobs synced successfully');
    } catch (error) {
        console.error('❌ Failed to sync saved jobs:', error);
    }
}

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const options = {
        body: 'New job matches found for you!',
        icon: './assets/logo.jpeg',
        badge: './assets/logo.jpeg',
        vibrate: [200, 100, 200],
        data: {
            url: './pages/results.html'
        },
        actions: [
            {
                action: 'view',
                title: 'View Jobs',
                icon: './assets/logo.jpeg'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('JobLens - New Matches!', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('./pages/results.html')
        );
    }
});

// Network status monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NETWORK_STATUS') {
        // Broadcast network status to all clients
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({
                    type: 'NETWORK_STATUS_UPDATE',
                    online: navigator.onLine
                });
            });
        });
    }
});

// Utility functions
async function getPendingSaves() {
    // In a real implementation, this would use IndexedDB
    return [];
}

async function processSave(save) {
    // Process individual save operation
    console.log('Processing save:', save);
}