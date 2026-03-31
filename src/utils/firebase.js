import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey:      import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:   import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:       import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = () => !!import.meta.env.VITE_FIREBASE_PROJECT_ID

let app, db, auth
if (isFirebaseConfigured()) {
  app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  db   = getFirestore(app)
  auth = getAuth(app)
}

export { db, auth }

// Call once on app start — signs in anonymously so Firestore rules can use request.auth.uid
export async function ensureFirebaseAuth() {
  if (!isFirebaseConfigured() || !auth) return null
  if (auth.currentUser) return auth.currentUser
  try {
    const cred = await signInAnonymously(auth)
    return cred.user
  } catch (e) {
    console.warn('Firebase anon auth failed:', e.message)
    return null
  }
}
