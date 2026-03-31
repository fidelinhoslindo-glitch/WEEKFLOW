// Offline write queue — persists pending Firestore writes when user is offline
import { dbSaveTasks, dbSaveProfile } from './firebaseDB'

const QUEUE_KEY = 'wf_offline_queue'

const load = () => { try { const v = localStorage.getItem(QUEUE_KEY); return v ? JSON.parse(v) : [] } catch { return [] } }
const persist = (q) => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {} }

export function enqueueWrite(type, payload) {
  const q = load()
  q.push({ type, payload, timestamp: Date.now() })
  persist(q)
}

export function getQueue() {
  return load()
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY)
}

export async function flushQueue(uid) {
  if (!uid) return
  const q = load()
  if (!q.length) return

  const errors = []
  for (const item of q) {
    try {
      if (item.type === 'save_tasks') {
        await dbSaveTasks(uid, item.payload)
      } else if (item.type === 'save_profile') {
        await dbSaveProfile(uid, item.payload)
      }
      // 'save_notes' can be added here when notes use Firestore
    } catch (err) {
      errors.push(item)
    }
  }

  if (errors.length) {
    // Keep only items that failed
    persist(errors)
  } else {
    clearQueue()
  }
}
