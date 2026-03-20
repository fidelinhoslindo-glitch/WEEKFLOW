import { createClient } from '@supabase/supabase-js'

// ─── Paste your Supabase project credentials here ─────────────────────────────
// 1. Go to https://supabase.com → New project
// 2. Settings → API → copy Project URL and anon key
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
})

// ─── Helper: is Supabase configured? ──────────────────────────────────────────
export const isConfigured = () =>
  SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co' && SUPABASE_ANON !== 'YOUR_ANON_KEY'
