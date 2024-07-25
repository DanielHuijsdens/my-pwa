const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/newpage.html',
    '/style.css',
    '/app.js'
];

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log(`Opened cache: ${CACHE_NAME}`);
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.log('Error caching resources:', error);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Old caches deleted.');
        })
    );
});

self.addEventListener('fetch', event => {
    console.log(`Fetching: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log(`Cache hit: ${event.request.url}`);
                return response; // Return the cached response if found
            }
            console.log(`Cache miss: ${event.request.url}`);
            return fetch(event.request).catch(() => {
                // Optionally handle network fetch failure here
                return new Response('Network error occurred', {
                    status: 408, // Request Timeout
                    statusText: 'Network error occurred',
                });
            });
        })
    );
});