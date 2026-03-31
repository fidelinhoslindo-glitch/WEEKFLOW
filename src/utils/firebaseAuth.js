import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

// Temporary holder for unverified user (needed for resend after signOut)
let _pendingVerificationUser = null

// ── Sign up ───────────────────────────────────────────────────────────────────
export async function fbSignUp(email, password) {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  _pendingVerificationUser = cred.user
  await sendEmailVerification(cred.user)
  return cred.user
}

// ── Resend verification email ────────────────────────────────────────────────
export async function fbResendVerificationEmail() {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const target = auth.currentUser || _pendingVerificationUser
  if (!target) throw new Error('Not authenticated')
  await sendEmailVerification(target)
}

export function fbClearPendingVerification() {
  _pendingVerificationUser = null
}

// ── Sign in ───────────────────────────────────────────────────────────────────
export async function fbSignIn(email, password) {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
export async function fbSignInWithGoogle() {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  // Electron: can't do popup — use redirect
  if (window.electron?.openExternal) {
    await signInWithRedirect(auth, googleProvider)
    return null
  }
  const cred = await signInWithPopup(auth, googleProvider)
  return cred.user
}

// Call once on mount to catch Google redirect result
export async function fbGetRedirectResult() {
  if (!isFirebaseConfigured() || !auth) return null
  try {
    const result = await getRedirectResult(auth)
    return result?.user || null
  } catch { return null }
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function fbSendPasswordReset(email) {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  await sendPasswordResetEmail(auth, email)
}

export async function fbUpdatePassword(newPassword) {
  if (!isFirebaseConfigured()) throw new Error('Firebase not configured')
  if (!auth.currentUser) throw new Error('Not authenticated')
  await updatePassword(auth.currentUser, newPassword)
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function fbSignOut() {
  if (!isFirebaseConfigured() || !auth) return
  await signOut(auth)
}

// ── Auth state listener ───────────────────────────────────────────────────────
export function fbOnAuthStateChanged(callback) {
  if (!isFirebaseConfigured() || !auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

// ── Get current Firebase ID token (for rules) ─────────────────────────────────
export async function fbGetIdToken() {
  if (!auth?.currentUser) return null
  return auth.currentUser.getIdToken()
}
