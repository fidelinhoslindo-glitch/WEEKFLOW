// WeekFlow Service Worker — Push Notifications + Offline Cache
const CACHE = 'weekflow-v2'
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

// ── Fetch: serve from cache when offline ─────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Skip non-same-origin
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => cached || new Response('Offline'))
    })
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
      // Focus existing WeekFlow tab
      const existing = clientList.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      // Open new tab
      return clients.openWindow(e.notification.data?.url || '/')
    })
  )
})

// ── Background Sync: alarm check ─────────────────────────────────────────────
// This runs even when the app is closed
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
  // App sends current tasks to SW for background alarm checks
  if (e.data?.type === 'STORE_ALARMS') {
    caches.open('weekflow-alarms').then(c =>
      c.put('alarms', new Response(JSON.stringify(e.data.alarms)))
    )
  }
  // App asks SW to show a notification immediately
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body:    e.data.body,
      icon:    '/icon-192.png',
      vibrate: [200, 100, 200],
      tag:     'weekflow-' + Date.now(),
    })
  }
})
