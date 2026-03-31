import {
  collection, doc, getDocs, setDoc, deleteDoc,
  writeBatch, onSnapshot, getDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

// ─────────────────────────────────────────────────────────────────────────────
// Firestore layout (user data)
//
//   users/{uid}/tasks/{taskId}
//   users/{uid}/notes/{noteId}
//   users/{uid}/profile  (single doc)
// ─────────────────────────────────────────────────────────────────────────────

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function dbGetTasks(uid) {
  if (!isFirebaseConfigured()) return []
  const snap = await getDocs(collection(db, 'users', uid, 'tasks'))
  return snap.docs.map(d => d.data())
}

export async function dbSaveTasks(uid, tasks) {
  if (!isFirebaseConfigured() || !tasks?.length) return
  const batch = writeBatch(db)
  tasks.forEach(t => {
    batch.set(doc(db, 'users', uid, 'tasks', t.id), t)
  })
  await batch.commit()
}

export async function dbDeleteTask(uid, taskId) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'users', uid, 'tasks', taskId))
}

export async function dbDeleteAllTasks(uid) {
  if (!isFirebaseConfigured()) return
  const snap = await getDocs(collection(db, 'users', uid, 'tasks'))
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function dbGetNotes(uid) {
  if (!isFirebaseConfigured()) return []
  const snap = await getDocs(collection(db, 'users', uid, 'notes'))
  return snap.docs.map(d => d.data())
}

export async function dbSaveNote(uid, note) {
  if (!isFirebaseConfigured()) return
  await setDoc(doc(db, 'users', uid, 'notes', note.id), note)
}

export async function dbDeleteNote(uid, noteId) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'users', uid, 'notes', noteId))
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function dbGetProfile(uid) {
  if (!isFirebaseConfigured()) return null
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'))
  return snap.exists() ? snap.data() : null
}

export async function dbSaveProfile(uid, profile) {
  if (!isFirebaseConfigured()) return
  await setDoc(doc(db, 'users', uid, 'profile', 'data'), profile, { merge: true })
}

// ── Realtime tasks subscription ───────────────────────────────────────────────

export function dbSubscribeToTasks(uid, onUpdate) {
  if (!isFirebaseConfigured()) return () => {}
  return onSnapshot(collection(db, 'users', uid, 'tasks'), snap => {
    onUpdate(snap.docs.map(d => d.data()))
  })
}
