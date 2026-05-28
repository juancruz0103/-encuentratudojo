// Service Worker — EncuentraTuDojo PWA
const CACHE_NAME = 'etd-v2'
const STATIC_ASSETS = ['/', '/buscador', '/tablero', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  if (event.request.url.includes('supabase.co')) return
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// ── NOTIFICACIONES PUSH ──
self.addEventListener('push', event => {
  let data = { title: 'EncuentraTuDojo', body: 'Tenés un nuevo contacto', icon: '/icons/icon-192.svg' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  data.icon ?? '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      vibrate: [200, 100, 200],
      data:  { url: '/dashboard' },
      actions: [
        { action: 'open',    title: 'Ver dashboard' },
        { action: 'dismiss', title: 'Ignorar' },
      ]
    })
  )
})

// Click en la notificación → abrir dashboard
self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const dashboardUrl = self.registration.scope + 'dashboard'
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/dashboard')
    })
  )
})
