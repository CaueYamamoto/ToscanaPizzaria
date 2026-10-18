/* Toscana SW — v2: navigate network-first, nunca retorna redirect ao browser */
const CACHE = 'toscana-v9';
const CORE = [
  '/',
  '/index.html',
  '/pizzas.html',
  '/esfirras.html',
  '/sobre.html',
  '/css/style.css',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function fetchPage(request) {
  // Segue redirects da Vercel (cleanUrls). URLs limpas (/pizzas) só existem lá;
  // em hosts estáticos (Live Server) tentamos o .html correspondente.
  const url = new URL(request.url);
  const candidates = [request];
  const hasExt = /\.[a-z0-9]+$/i.test(url.pathname);
  if (url.pathname !== '/' && !hasExt) {
    candidates.push(url.origin + url.pathname.replace(/\/$/, '') + '.html' + url.search);
  }
  for (const c of candidates) {
    try {
      let res = await fetch(c);
      if (res.redirected) res = await fetch(res.url);
      if (res.ok && res.type !== 'opaque') return res;
    } catch {}
  }
  return null;
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // só mesma origem
  if (e.request.method !== 'GET') return;
  if (url.pathname.includes('/js/')) return; // preço sempre fresco

  // CSS: network-first para propagar atualizações (fallback offline ao cache)
  if (url.pathname.startsWith('/css/')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok && res.type !== 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        }
        return caches.match(e.request).then((hit) => hit || res);
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Navegação: network-first + achata redirect + fallback offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      (async () => {
        const res = await fetchPage(e.request);
        if (res) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        }
        const hit = await caches.match(e.request);
        return hit || (await caches.match('/index.html'));
      })()
    );
    return;
  }

  // Assets: cache-first, sem cachear redirect/opaque/erro
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const flat = res.redirected ? null : res;
        if (flat && flat.ok && flat.type !== 'opaque') {
          const copy = flat.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return flat;
        }
        // Se veio redirect aqui (asset versionado não deveria), busca URL final
        if (res.redirected) return fetch(res.url);
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
