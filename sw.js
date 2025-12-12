// JobLens Service Worker
const CACHE_NAME = 'joblens-v1.2';
const STATIC_CACHE = 'joblens-static-v1.2';
const DYNAMIC_CACHE = 'joblens-dynamic-v1.2';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/pages/questionnaire.html',
    '/pages/results.html',
    '/pages/dashboard.html',
    '/pages/about.html',
    '/css/base.css',
    '/css/landing.css',
    '/css/questionnaire.css',
    '/css/results.css',
    '/css/dashboard.css',
    '/css/about.css',
    '/js/questionnaire.js',
    '/js/results.js',
    '/js/dashboard.js',
    '/js/theme.js',
    '/js/job-api.js',
    '/assets/logo.jpeg',
    '/assets/jobs.json'
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
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Serve from cache
                    return cachedResponse;
                }
                
                // Fetch from network and cache
                return fetch(request)
                    .then((networkResponse) => {
                        // Only cache successful responses
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // Return a basic offline response
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
                    });
            })
    );
});

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