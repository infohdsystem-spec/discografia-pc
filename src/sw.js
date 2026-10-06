/* =========================================================================
   DISCOGRAFÍA v8.0.0 — Service Worker
   Autor: HDSystem IT · Tel: +54 9 11 4563-0851

   Estrategia:
   - Assets propios (HTML/CSS/JS): cache-first con update en background.
   - APIs externas (Discogs, MB, CAA, iTunes, Odesli, Last.fm): network-only.
   - CDN (chart.js, html5-qrcode, qrcode.js): network-first con runtime cache.

   ⚠️ Cuando cambies cualquier archivo JS o el index.html, subí SW_VERSION
   para forzar la reinstalación del SW.
   ========================================================================= */

const SW_VERSION = 'discografia-v8.0.0';
const STATIC_CACHE = `${SW_VERSION}-static`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app-i18n.js',
  './app-workspaces.js',
  './app-tags.js',
  './app-savedfilters.js',
  './app-commandpalette.js',
  './app-shortcuts.js',
  './app-core-0-storage.js',
  './app-core-1-base.js',
  './app-core-2-api.js',
  './app-core-3-enrich.js',
  './lastfm.js',
  './app-ui-1-estado.js',
  './app-ui-2-render.js',
  './app-ui-3-modal.js',
  './app-ui-4-init.js',
  './app-labels.js',
  './TESTS.html'
];

const API_HOSTS = [
  'api.discogs.com',
  'musicbrainz.org',
  'coverartarchive.org',
  'itunes.apple.com',
  'api.song.link',
  'ws.audioscrobbler.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      const results = await Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(new Request(url, { cache: 'reload' })))
      );
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`[SW] Install: ${STATIC_ASSETS.length - failed}/${STATIC_ASSETS.length} assets cacheados`);
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('discografia-') && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
        .map(k => { console.log('[SW] Eliminando cache viejo:', k); return caches.delete(k); })
    )).then(() => {
      console.log('[SW] Activate: version', SW_VERSION);
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* APIs externas: network-only (no cachear respuestas dinámicas) */
  if (API_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) {
    event.respondWith(
      fetch(request).catch(() => new Response(
        JSON.stringify({ error: 'offline', message: 'Sin conexión a internet' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  /* CDN de librerías: network-first con cache runtime */
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        fetch(request).then(res => {
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        }).catch(() => cache.match(request))
      )
    );
    return;
  }

  /* Assets propios: cache-first con background update */
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* El cliente puede pedir activar la nueva versión inmediatamente */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING recibido');
    self.skipWaiting();
  }
});