// Service worker de Procar Performance (generado en el build; no editar dist/sw.js).
// - Páginas HTML: stale-while-revalidate (carga instantánea desde caché y se actualiza en segundo plano).
// - /_astro/* (archivos con hash, inmutables) e imágenes: cache-first.
// - Todo lo externo (calendarios GHL, WhatsApp, redes): pasa directo a la red.
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const STATIC = `procar-static-${VERSION}`;
const RUNTIME = 'procar-runtime';
const RUNTIME_MAX = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC, RUNTIME]);
      for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - RUNTIME_MAX; i++) await cache.delete(keys[i]);
}

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') {
    const c = await caches.open(RUNTIME);
    c.put(req, res.clone()).then(() => trim(c));
  }
  return res;
}

async function staleWhileRevalidate(event) {
  const req = event.request;
  const url = new URL(req.url);
  const key = url.origin + url.pathname.replace(/index\.html$/, '');
  const cached = (await caches.match(key, { ignoreSearch: true })) || (await caches.match(req));
  const network = (async () => {
    const res = (await event.preloadResponse) || (await fetch(req));
    if (res.ok && res.type === 'basic') {
      const c = await caches.open(STATIC);
      await c.put(key, res.clone());
    }
    return res;
  })();
  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }
  try {
    return await network;
  } catch {
    return (await caches.match('/')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(event));
  } else if (url.pathname.startsWith('/_astro/') || req.destination === 'image' || req.destination === 'font') {
    event.respondWith(cacheFirst(req));
  }
});
