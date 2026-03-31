import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

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

export const googleProvider = new GoogleAuthProvider()
export { db, auth }
