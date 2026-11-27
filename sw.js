const CACHE_NAME="nexora-shell-v2";
const CORE=["/","/index.html","/icon.svg","/manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("nexora-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
 if(req.mode==="navigate"){event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put("/",copy))}return res}).catch(()=>caches.match("/")||caches.match("/index.html")));return}
 event.respondWith(caches.match(req).then(cached=>{const network=fetch(req).then(res=>{if(res.ok&&res.type==="basic"){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy))}return res});return cached||network}));
});