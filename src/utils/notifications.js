// ── WeekFlow Notifications Utility ───────────────────────────────────────────
// Uses browser Notification API + service worker messaging for local notifications.
// Does NOT use Firebase Cloud Messaging — all scheduling is client-side.

const WEEK_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ── Register service worker ───────────────────────────────────────────────────
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch {
    return null
  }
}

// ── Request permission ────────────────────────────────────────────────────────
// Returns 'granted' | 'denied' | 'default'
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return 'denied'
  }
}

// ── Show notification via service worker (or fallback to Notification API) ────
export function showNotification(title, body, url = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  // Prefer service worker for richer notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
      url,
    })
    return
  }

  // Fallback: direct Notification API (no actions, simpler)
  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  } catch {}
}

// ── Active setTimeout IDs — keyed by task ID to avoid duplicates ─────────────
const _scheduledReminders = new Map()

// ── Schedule a 15-minute-before reminder for a task with a time set today ─────
// task shape: { id, title, day, time } where day is 'Monday' etc, time is 'HH:MM'
export function scheduleTaskReminder(task) {
  if (!task?.time || !task?.day) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  // Resolve today's day name
  const todayName = WEEK_DAYS[new Date().getDay()]
  if (task.day !== todayName) return

  // Parse task time
  const [taskHour, taskMin] = task.time.split(':').map(Number)
  if (isNaN(taskHour) || isNaN(taskMin)) return

  const now = new Date()
  const taskDate = new Date(now)
  taskDate.setHours(taskHour, taskMin, 0, 0)

  // Reminder fires 15 minutes before
  const reminderTime = taskDate.getTime() - 15 * 60 * 1000
  const msUntilReminder = reminderTime - now.getTime()

  // Skip if already passed or more than 12h away (stale)
  if (msUntilReminder <= 0 || msUntilReminder > 12 * 60 * 60 * 1000) return

  // Cancel previous timer for this task if any
  if (_scheduledReminders.has(task.id)) {
    clearTimeout(_scheduledReminders.get(task.id))
  }

  const timerId = setTimeout(() => {
    showNotification(
      'WeekFlow Reminder',
      `"${task.title}" starts in 15 minutes`,
      '/?page=planner'
    )
    _scheduledReminders.delete(task.id)
  }, msUntilReminder)

  _scheduledReminders.set(task.id, timerId)
}

// ── Schedule reminders for all tasks due today ────────────────────────────────
export function scheduleAllTodayReminders(tasks) {
  if (!Array.isArray(tasks)) return
  const todayName = WEEK_DAYS[new Date().getDay()]
  tasks
    .filter(t => t.day === todayName && t.time && !t.completed)
    .forEach(scheduleTaskReminder)
}

// ── Cancel all scheduled reminders ───────────────────────────────────────────
export function cancelAllReminders() {
  for (const id of _scheduledReminders.values()) clearTimeout(id)
  _scheduledReminders.clear()
}
