// خدمة العمل بدون إنترنت: الواجهة من الشبكة أولاً، والصور والبلاطات من الذاكرة أولاً
const C='ajlan-v7-17',SHELL=['./','./index.html','./nasab.html','./people_all.json','./manifest.webmanifest','./bg/bg-scene.jpg','./bg/crown-mask.png','./bg/node-mask.png','./bg/logo.png','../v4/tree-small.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const img=/\.(jpg|jpeg|png|webp)$/i.test(u.pathname);
  if(img)e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}))));
  else e.respondWith(fetch(r).then(res=>{if(res.ok&&u.origin===location.origin){const cl=res.clone();caches.open(C).then(c=>c.put(r,cl));}return res;}).catch(()=>caches.match(r)));});
