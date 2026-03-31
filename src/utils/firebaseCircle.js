import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc,
  addDoc, updateDoc, query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

// ─────────────────────────────────────────────────────────────────────────────
// Firestore layout
//
//   circles/{circleId}
//     members/{userId}     — member docs, keyed by userId
//     events/{eventId}     — event docs
//     invites/{inviteId}   — pending invites (email-based)
//
//   (invites live inside the circle so no collectionGroup index is needed)
// ─────────────────────────────────────────────────────────────────────────────

// ── Circles ───────────────────────────────────────────────────────────────────

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
  await setDoc(
    doc(db, 'circles', circleId, 'members', memberData.userId),
    memberData,
    { merge: true }
  )
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

// ── Invites (stored inside the circle, keyed by email) ───────────────────────

export async function fbSendInvite({ circleId, circleName, circleMode, inviterName, email }) {
  if (!isFirebaseConfigured()) return { ok: false, error: 'Firebase not configured' }
  try {
    const normalEmail = email.toLowerCase()
    const safeEmail   = normalEmail.replace(/[^a-z0-9]/g, '_')
    const inboxId     = `${safeEmail}__${circleId}`
    const payload = {
      circleId,
      circleName,
      circleMode,
      inviterName,
      email: normalEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    // Write inside circle (source of truth) + flat invite_inbox (for listener)
    await Promise.all([
      setDoc(doc(db, 'circles', circleId, 'invites', safeEmail), payload),
      setDoc(doc(db, 'invite_inbox', inboxId), { ...payload, inboxId }),
    ])
    return { ok: true, inviteId: safeEmail }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

/**
 * Mark invite as accepted/declined.
 * inboxId = the doc ID in invite_inbox (returned by fbSendInvite as inviteId,
 * stored in the notification as inv.inboxId).
 */
export async function fbUpdateInviteStatus(circleId, safeEmailId, status) {
  if (!isFirebaseConfigured()) return
  const inboxId = `${safeEmailId}__${circleId}`
  await Promise.all([
    updateDoc(doc(db, 'circles', circleId, 'invites', safeEmailId), { status }).catch(() => {}),
    updateDoc(doc(db, 'invite_inbox', inboxId), { status }).catch(() => {}),
  ])
}

// ── Realtime subscriptions ────────────────────────────────────────────────────

/** Subscribe to members of a single circle. Returns { unsubscribe }. */
export function fbSubscribeToMembers(circleId, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const unsub = onSnapshot(
    collection(db, 'circles', circleId, 'members'),
    snap => onUpdate(snap.docs.map(d => d.data()))
  )
  return { unsubscribe: unsub }
}

/** Subscribe to events of a single circle. Returns { unsubscribe }. */
export function fbSubscribeToEvents(circleId, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const unsub = onSnapshot(
    collection(db, 'circles', circleId, 'events'),
    snap => onUpdate(snap.docs.map(d => d.data()))
  )
  return { unsubscribe: unsub }
}

/**
 * Subscribe to pending invites for a given email across ALL circles.
 *
 * Strategy: we query the global circle_invites_index collection which is a
 * flat mirror kept for cross-circle lookups — OR we use a collectionGroup.
 *
 * To avoid collectionGroup index requirements we use a dedicated top-level
 * mirror collection: `invite_inbox/{email}/pending/{inviteId}`
 *
 * But since we want zero extra writes, we simply query the top-level
 * `invite_inbox` collection where we store a copy on fbSendInvite.
 *
 * Simpler approach that works without indexes: store a parallel doc in
 * `invite_inbox/{sanitizedEmail}_{circleId}` and subscribe to that.
 *
 * SIMPLEST that needs no extra index: on fbSendInvite, ALSO write to
 * `invite_inbox` collection. Subscribe to that.
 */
export function fbSubscribeToInvites(email, onUpdate) {
  if (!isFirebaseConfigured()) return { unsubscribe: () => {} }
  const q = query(
    collection(db, 'invite_inbox'),
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending')
  )
  const unsub = onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
  return { unsubscribe: unsub }
}
