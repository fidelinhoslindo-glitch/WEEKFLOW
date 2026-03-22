// WeekFlow Service Worker — Push Notifications + Offline Cache
const CACHE = 'weekflow-v3'
const STATIC = ['/','./index.html']

// ── Install: cache static assets ─────────────────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  )
})

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: network-first, fallback to cache when offline ─────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith(self.location.origin)) return

  // For navigation requests (HTML pages), always go network-first
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => caches.match(e.request).then(c => c || caches.match('/')))
    )
    return
  }

  // For assets (JS, CSS, images): network-first with cache fallback
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }).catch(() => caches.match(e.request))
  )
})

// ── Push: receive push notification from server ───────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'WeekFlow', body: 'You have a new notification' }
  try { data = e.data?.json() || data } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      vibrate: [200, 100, 200],
      tag:     'weekflow-notification',
      data:    { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'Open WeekFlow' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()

  if (e.action === 'dismiss') return

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const existing = clientList.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(e.notification.data?.url || '/')
    })
  )
})

// ── Background Sync: alarm check ─────────────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'weekflow-alarm-check') {
    e.waitUntil(checkAlarms())
  }
})

async function checkAlarms() {
  try {
    const cache = await caches.open('weekflow-alarms')
    const res   = await cache.match('alarms')
    if (!res) return
    const alarms = await res.json()
    const now    = new Date()
    const hhmm   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const today  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]

    for (const alarm of alarms) {
      if (alarm.day === today && alarm.time === hhmm && !alarm.fired) {
        await self.registration.showNotification(`⏰ WeekFlow Reminder`, {
          body:    `"${alarm.title}" starts now!`,
          icon:    '/icon-192.png',
          vibrate: [300, 100, 300],
          tag:     `alarm-${alarm.id}`,
        })
      }
    }
  } catch(err) {}
}

// ── Message from app ─────────────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'STORE_ALARMS') {
    caches.open('weekflow-alarms').then(c =>
      c.put('alarms', new Response(JSON.stringify(e.data.alarms)))
    )
  }
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body:    e.data.body,
      icon:    '/icon-192.png',
      vibrate: [200, 100, 200],
      tag:     'weekflow-' + Date.now(),
    })
  }
})
