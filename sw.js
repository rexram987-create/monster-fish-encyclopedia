const CACHE='monster-fish-v10-name-explanations';
const CORE=['./','./index.html','./styles.css','./data.js','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
  './images/fish/arapaima-gigas.webp',
  './images/fish/hydrocynus-goliath.webp',
  './images/fish/atractosteus-spatula.webp',
  './images/fish/silurus-glanis.webp',
  './images/fish/pangasius-sanitwongsei.webp',
  './images/fish/phractocephalus-hemioliopterus.webp',
  './images/fish/pangasianodon-gigas.webp',
  './images/fish/urogymnus-polylepis.webp',
  './images/fish/hydrolycus-scomberoides.webp',
  './images/fish/brachyplatystoma-filamentosum.webp',
  './images/fish/osteoglossum-bicirrhosum.webp',
  './images/fish/lates-niloticus.webp',
  './images/fish/colossoma-macropomum.webp',
  './images/fish/bagarius-bagarius.webp',
  './images/fish/pygocentrus-nattereri.webp',
  './images/fish/electrophorus-electricus.webp',
  './images/fish/balantiocheilos-melanopterus.webp',
  './images/fish/epalzeorhynchos-frenatum.webp',
  './images/fish/epalzeorhynchos-bicolor.webp',
  './images/fish/labeo-chrysophekadion.webp',
  './images/fish/myxocyprinus-asiaticus.webp',
  './images/fish/pangasianodon-hypophthalmus.webp',
  './images/fish/ariopsis-seemanni.webp'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res && res.ok && e.request.url.startsWith(self.location.origin)){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
