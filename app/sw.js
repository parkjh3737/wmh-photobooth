// 한 번 연 뒤에는 와이파이가 끊겨도 화면이 뜨도록 파일을 보관한다.
// 항상 새 파일을 먼저 받아오고(network-first), 실패할 때만 보관본을 쓴다 → 파일을 고쳐 올리면 새로고침 한 번에 반영된다.
const C = 'wmh-booth-v6';
const FILES = ['./', 'index.html', 'css/style.css', 'js/main.js', 'js/config.js', 'js/draw.js', 'js/frames.js',
  'fonts/jost-300.woff2', 'fonts/jost-400.woff2', 'fonts/jost-600.woff2', 'fonts/jost-700.woff2', 'fonts/wmh-serif-kr.woff2', 'fonts/hand-cursive.woff2', 'fonts/hand-marker.woff2', 'fonts/script.woff2', 'fonts/brush.woff2', 'fonts/bubble.woff2', 'fonts/wmh-sans-kr.woff2',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'logo/logo.png', 'photos/1.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== C).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
