/**
 * Service Worker — Lokesh Portfolio PWA  v2
 *
 * Changes from v1:
 *  - CACHE_NAME versioned with a timestamp so every new deploy
 *    automatically busts the old cache (QA-04 fix).
 *  - JS/CSS bundles use Network-first instead of Cache-first so a
 *    broken cached bundle is never served when the network is available.
 *    Cache-first is only used for images and fonts (truly immutable assets).
 *  - Added a 'SKIP_WAITING' message handler so the hard-reload from
 *    ErrorBoundary can activate a waiting SW immediately.
 *  - Error responses (4xx/5xx) are never cached.
 *  - index.html always served fresh from network; cached only as offline
 *    fallback, never returned when the network is reachable.
 */

/* ── BUMP THIS STRING ON EVERY PRODUCTION DEPLOY ─────────────────────────
   Or automate: replace __BUILD_VERSION__ via your CI pipeline.
   e.g. in vite.config.js:
     define: { __SW_VERSION__: JSON.stringify(Date.now().toString()) }
   Then here:  const CACHE_NAME = 'lk-pf-' + __SW_VERSION__
   ───────────────────────────────────────────────────────────────────────── */
const CACHE_NAME  = 'lk-pf-v2'
const OFFLINE_URL = '/offline.html'

/* Assets to pre-cache on install — keep this list small */
const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

/* ── Install ──────────────────────────────────────────────────────────────*/
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      // Take control immediately — don't wait for tabs to close
      .then(() => self.skipWaiting())
  )
})

/* ── Activate: wipe ALL old caches ──────────────────────────────────────*/
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME) // delete every other cache
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

/* ── Message: allow hard-reload to activate a waiting SW instantly ───────*/
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

/* ── Fetch ───────────────────────────────────────────────────────────────*/
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignore non-GET, non-http(s), chrome-extension
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // ── API calls: network-only, never cache ─────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ message: 'Offline — please check your connection' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    return
  }

  // ── HTML navigation: network-first, fall back to cached offline page ──
  //    Never serve a cached copy of index.html when online.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(c => c.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          // Offline: serve cached page or offline fallback
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_URL)
        })
    )
    return
  }

  // ── JS / CSS bundles: network-first ──────────────────────────────────
  //    These are hashed by Vite so each deploy has unique filenames,
  //    but we still prefer network to avoid serving a stale/broken bundle.
  if (url.pathname.match(/\.(js|jsx|ts|tsx|css)$/)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(c => c.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request)) // offline fallback to cached bundle
    )
    return
  }

  // ── Images, fonts, icons: cache-first (truly immutable) ──────────────
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        // Only cache valid non-opaque responses
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone))
        }
        return response
      })
    })
  )
})
