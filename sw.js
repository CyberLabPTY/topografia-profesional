const CACHE='topografia-v13';
const ASSETS=['./','./index.html','./styles-v9.css?v=13','./enhancements-v10.css?v=13','./enhancements-v11.css?v=13','./enhancements-v12.css?v=13','./enhancements-v13.css?v=13','./app-v11.js?v=13','./app-v12.js?v=13','./app-v13.js?v=13','./config.js?v=13','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(()=>caches.match(event.request).then(match=>match||caches.match('./index.html')))
  );
});
