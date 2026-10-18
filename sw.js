importScripts('./assets.js');
const CACHE_PREFIX = 'despesas-fatura-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE_NAME = CACHE_PREFIX + self.APP_VERSION;
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(cache => cache.addAll([...self.APP_ASSETS, './assets.js']))
));
self.addEventListener('activate', e => e.waitUntil((async () => {
  // CacheStorage is shared by the origin. Do not delete sibling installations or legacy caches of unknown scope.
  for (const key of await caches.keys()) {
    if (key !== CACHE_NAME && key.startsWith(CACHE_PREFIX)) await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  let key = url.href;
  const root = new URL('./', self.registration.scope);
  if (e.request.mode === 'navigate' && (url.pathname === root.pathname || url.pathname === root.pathname + 'index.html')) {
    key = new URL('./index.html', self.registration.scope).href;
  }
  if (!self.APP_ASSETS.some(asset => new URL(asset, self.registration.scope).href === key)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(key);
    if (cached) return cached;
    try {
      const response = await fetch(key);
      if (response.ok && response.type !== 'opaque') await cache.put(key, response.clone());
      return response;
    } catch {
      return new Response('Recurso indisponível offline.', {status: 503});
    }
  })());
});
