const CACHE_NAME = 'pokemon-v2';
const OFFLINE_URL = '/offline.html';
const PRE_CACHED_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/assets/loading.gif'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRE_CACHED_RESOURCES))
            .then(self.skipWaiting())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(OFFLINE_URL))
        );
    } else if (PRE_CACHED_RESOURCES.some(url => event.request.url.includes(url))) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});