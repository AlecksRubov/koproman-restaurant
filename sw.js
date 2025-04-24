// Версия кэша - при изменении обновится автоматически
const CACHE_VERSION = 'koproman_v3';
const OFFLINE_PAGE = '/offline.html';

// Основные ресурсы для кэширования
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    '/img/logo.webp',
    '/img/icons/icon-192.png',
    '/img/icons/icon-512.png',
    OFFLINE_PAGE
];

// Стратегии кэширования
const CACHE_RULES = {
    page: {
        strategy: 'NetworkFirst',
        cacheName: 'pages',
        options: {
            cacheableResponse: {statuses: [200]}
        } 
    }, 
    image: {
        strategy: 'StaleWhileRevalidate',
        cacheName: 'images',
        options: {
            cacheableResponse: {statuses: [0, 200]},
            expiration: {maxEntries: 50, maxAgeSeconds: 2592000}
        } 
    }, 
    font: {
        strategy: 'CacheFirst',
        cacheName: 'fonts',
        options: {
            cacheableResponse: {statuses: [0, 200]},
            expiration: {maxAgeSeconds: 31536000}
        } 
    } 
}; 

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => {
                console.log('Кэширование основных ресурсов');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            )
        )
        .then(() => self.clients.claim())
    );
});

// Обработка запросов
self.addEventListener('fetch', event => {
    const {request} = event;
    const url = new URL(request.url);
    
    // Пропускаем POST-запросы и другие методы
    if (request.method !== 'GET') return;
    
    // Определяем тип ресурса
    let resourceType = 'static';
    if (url.pathname.endsWith('.html')) resourceType = 'page';
    if (/\.(jpe?g|png|webp|svg)$/i.test(url.pathname)) resourceType = 'image';
    if (/\.(woff2?|ttf|eot)$/i.test(url.pathname)) resourceType = 'font';

    // Выбираем стратегию
    switch(resourceType) {
        case 'page':
            event.respondWith(networkFirst(request));
            break;
            
        case 'image':
            event.respondWith(staleWhileRevalidate(request));
            break;
            
        default:
            event.respondWith(cacheFirst(request));
    }
});

// Стратегии кэширования

// 1. Сначала сеть, потом кэш (для HTML)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match(OFFLINE_PAGE);
    }
}

// 2. Сначала кэш, потом сеть (для статики)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        return caches.match(OFFLINE_PAGE);
    }
}

// 3. Устаревший при повторной проверке (для изображений)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_VERSION);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Фоновая синхронизация
self.addEventListener('sync', event => {
    if (event.tag === 'sync-bookings') {
        event.waitUntil(syncPendingBookings());
    }
});

async function syncPendingBookings() {
    // Логика синхронизации данных
}