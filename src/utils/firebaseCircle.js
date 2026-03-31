import {
  collection, collectionGroup, doc, getDocs, getDoc, setDoc, deleteDoc,
  addDoc, updateDoc, query, where, onSnapshot,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

// ── Circles ───────────────────────────────────────────────────────────────────

export async function fbListCircles(userId) {
  if (!isFirebaseConfigured()) return []
  // Use collectionGroup to find all member docs for this userId
  const q = query(collectionGroup(db, 'members'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const circleIds = snap.docs.map(d => d.ref.parent.parent.id)
  if (circleIds.length === 0) return []
  const circles = await Promise.all(circleIds.map(id => getDoc(doc(db, 'circles', id))))
  return circles.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }))
}

export async function fbGetCircle(circleId) {
  if (!isFirebaseConfigured()) return null
  const snap = await getDoc(doc(db, 'circles', circleId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function fbUpsertCircle(circleData) {
  if (!isFirebaseConfigured()) return
  const { id, ...rest } = circleData
  await setDoc(doc(db, 'circles', id), { id, ...rest }, { merge: true })
}

export async function fbDeleteCircle(circleId) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'circles', circleId))
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function fbGetMembers(circleId) {
  if (!isFirebaseConfigured()) return []
  const snap = await getDocs(collection(db, 'circles', circleId, 'members'))
  return snap.docs.map(d => d.data())
}

export async function fbAddMember(circleId, memberData) {
  if (!isFirebaseConfigured()) return
  await setDoc(doc(db, 'circles', circleId, 'members', memberData.userId), memberData, { merge: true })
}

export async function fbRemoveMember(circleId, userId) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'circles', circleId, 'members', userId))
}

export async function fbUpdateMemberStatus(circleId, userId, status) {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(db, 'circles', circleId, 'members', userId), { status })
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function fbGetEvents(circleId) {
  if (!isFirebaseConfigured()) return []
  const snap = await getDocs(collection(db, 'circles', circleId, 'events'))
  return snap.docs.map(d => d.data())
}

export async function fbAddEvent(circleId, eventData) {
  if (!isFirebaseConfigured()) return
  await setDoc(doc(db, 'circles', circleId, 'events', eventData.id), eventData)
}

export async function fbDeleteEvent(circleId, eventId) {
  if (!isFirebaseConfigured()) return
  await deleteDoc(doc(db, 'circles', circleId, 'events', eventId))
}

// ── Invites ───────────────────────────────────────────────────────────────────

export async function fbSendInvite(inviteData) {
  if (!isFirebaseConfigured()) return { ok: false, error: 'Firebase not configured' }
  try {
    await addDoc(collection(db, 'circle_invites'), {
      ...inviteData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function fbGetPendingInvites(email) {
  if (!isFirebaseConfigured()) return []
  const q = query(
    collection(db, 'circle_invites'),
    where('email', '==', email),
    where('status', '==', 'pending')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function fbUpdateInviteStatus(inviteId, status) {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(db, 'circle_invites', inviteId), { status })
}

// ── Realtime subscriptions ────────────────────────────────────────────────────

export function fbSubscribeToEvents(circleId, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const unsub = onSnapshot(collection(db, 'circles', circleId, 'events'), snap => {
    const events = snap.docs.map(d => d.data())
    onUpdate(events)
  })
  return { unsubscribe: unsub }
}

export function fbSubscribeToMembers(circleId, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const unsub = onSnapshot(collection(db, 'circles', circleId, 'members'), snap => {
    const members = snap.docs.map(d => d.data())
    onUpdate(members)
  })
  return { unsubscribe: unsub }
}

export function fbSubscribeToInvites(email, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const q = query(
    collection(db, 'circle_invites'),
    where('email', '==', email),
    where('status', '==', 'pending')
  )
  const unsub = onSnapshot(q, snap => {
    const invites = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    onUpdate(invites)
  })
  return { unsubscribe: unsub }
}
