const CACHE = 'onebench-app-v5'
const BASE_PATH = new URL('./', self.location.href).pathname
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/onebench-192.png`,
  `${BASE_PATH}icons/onebench-512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  const requestUrl = new URL(event.request.url)

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      caches.open(CACHE).then((cache) => cache.put(BASE_PATH, response.clone()))
      return response
    }).catch(() => caches.match(BASE_PATH)))
    return
  }

  if (requestUrl.pathname.startsWith(`${BASE_PATH}assets/`) || requestUrl.pathname.startsWith(`${BASE_PATH}icons/`)) {
    event.respondWith(caches.match(event.request).then((cached) => {
      const fresh = fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()))
        return response
      }).catch(() => cached)
      return cached || fresh
    }))
  }
})
