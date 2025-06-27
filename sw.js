const CACHE_NAME = 'dawam-obada-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/pic.png'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع الملف من الكاش إذا وُجد
        if (response) {
          return response;
        }

        // إذا لم يوجد في الكاش، جلبه من الشبكة
        return fetch(event.request).then(
          function(response) {
            // التحقق من صحة الاستجابة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
