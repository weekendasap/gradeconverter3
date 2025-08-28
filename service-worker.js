const CACHE_NAME = 'gradeconvert2-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './favicon.svg',
  './manifest.webmanifest'
  // 외부 CDN(Chart.js)은 네트워크로 로드됨
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 동일 출처의 GET만 캐시 우선
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      }).catch(() => {
        // 네트워크/캐시 실패 시 루트 반환(네비게이션)
        if (req.mode === 'navigate') return caches.match('./index.html');
      }))
    );
  }
});
