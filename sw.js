/* Toscana SW — v2: navigate network-first, nunca retorna redirect ao browser */
const CACHE = 'toscana-v2';
const CORE = [
  '/',
  '/index.html',
  '/pizzas',
  '/pizzas.html',
  '/esfirras',
  '/esfirras.html',
  '/sobre',
  '/sobre.html',
  '/css/style.css',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function fetchFlattened(request) {
  // Segue redirects da Vercel (cleanUrls) até a URL final e NUNCA devolve redirect.
  let res = await fetch(request);
  if (res.redirected) {
    res = await fetch(res.url);
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // só mesma origem
  if (e.request.method !== 'GET') return;
  if (url.pathname.includes('/js/')) return; // preço sempre fresco

  // Navegação: network-first + achata redirect + fallback offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const res = await fetchFlattened(e.request);
          // Nunca cachear nem retornar redirect/opaque/erro
          if (!res.ok || res.redirected || res.type === 'opaque') {
            const hit = await caches.match(e.request);
            return hit || (await caches.match('/index.html'));
          }
          const copy = res.clone();
          const cache = await caches.open(CACHE);
          cache.put(e.request, copy).catch(() => {});
          return res;
        } catch {
          const hit = await caches.match(e.request);
          return hit || (await caches.match('/index.html'));
        }
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
