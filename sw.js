
const CACHE_NAME = 'despesas-cache-cc-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js'
];
self.addEventListener('install',(e)=>{
  e.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{ await cache.addAll(ASSETS);}catch(e){}
    self.skipWaiting();
  })());
});
self.addEventListener('activate',(e)=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null));
    self.clients.claim();
  })());
});
self.addEventListener('fetch',(e)=>{
  e.respondWith((async()=>{
    const cached=await caches.match(e.request);
    if(cached) return cached;
    try{
      const resp=await fetch(e.request,{mode:'cors'});
      const cache=await caches.open(CACHE_NAME);
      cache.put(e.request, resp.clone());
      return resp;
    }catch(err){
      return cached || new Response('Offline', {status:503, statusText:'Offline'});
    }
  })());
});
