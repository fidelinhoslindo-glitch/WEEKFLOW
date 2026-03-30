// ─── FlowCircle Realtime ─────────────────────────────────────────────────────
import { isSupabaseConfigured, getSupabaseCredentials } from './supabase'

const LS_CIRCLES = 'wf_circles'

export const CIRCLE_MODES = {
  couple:  { label:'Casal 💑',         icon:'💑', color:'from-pink-500 to-rose-500',     bg:'bg-pink-50 dark:bg-pink-900/20',     border:'border-pink-200 dark:border-pink-800',     text:'text-pink-600 dark:text-pink-300',     maxMembers:2,   description:'Sincronize sua rotina com seu parceiro(a)' },
  friends: { label:'Amigos 👥',         icon:'👥', color:'from-blue-500 to-cyan-500',     bg:'bg-blue-50 dark:bg-blue-900/20',     border:'border-blue-200 dark:border-blue-800',     text:'text-blue-600 dark:text-blue-300',     maxMembers:12,  description:'Planeje encontros e alinhe agendas com amigos' },
  family:  { label:'Família 👨‍👩‍👧‍👦',  icon:'👨‍👩‍👧‍👦', color:'from-emerald-500 to-green-500', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800', text:'text-emerald-600 dark:text-emerald-300', maxMembers:20, description:'Organize a rotina de toda a família' },
  company: { label:'Empresa 🏢',        icon:'🏢', color:'from-violet-500 to-indigo-500', bg:'bg-violet-50 dark:bg-violet-900/20',   border:'border-violet-200 dark:border-violet-800',   text:'text-violet-600 dark:text-violet-300',   maxMembers:100, description:'Escala, projetos e calendário de equipe' },
}

const DEMO = []

export function loadCircles()        { try { const v=localStorage.getItem(LS_CIRCLES); return v?JSON.parse(v):DEMO } catch { return DEMO } }
export function saveCircles(c)       { try { localStorage.setItem(LS_CIRCLES,JSON.stringify(c)) } catch {} }

// ── Real invite via email ─────────────────────────────────────────────────────
export async function sendRealInvite(circleId, circleName, inviterName, email, circleMode) {
  if (!isSupabaseConfigured()) {
    const link = generateCircleInviteLink(circleId, circleName)
    return { ok:true, method:'link', link, message:`Copy this link and send to ${email}` }
  }
  const { url, key } = getSupabaseCredentials()
  const token = (typeof window!=='undefined' && localStorage.getItem('wf_token')) || key
  try {
    const res = await fetch(`${url}/rest/v1/circle_invites`, {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${token}`,'Prefer':'return=minimal'},
      body:JSON.stringify({ circle_id:circleId, circle_name:circleName, circle_mode:circleMode||null, inviter_name:inviterName, email, status:'pending', created_at:new Date().toISOString() })
    })
    return res.ok ? { ok:true, method:'supabase' } : { ok:false, error:'Failed to store invite' }
  } catch(err) {
    return { ok:false, error:err.message }
  }
}

// ── Generate shareable join link ──────────────────────────────────────────────
export function generateCircleInviteLink(circleId, circleName, mode) {
  try {
    const payload = btoa(JSON.stringify({ circleId, circleName, mode, ts:Date.now() }))
    return `${window.location.origin}?join-circle=${payload}`
  } catch { return window.location.origin }
}

// ── Parse join link from URL ──────────────────────────────────────────────────
export function parseCircleInviteLink() {
  try {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('join-circle')
    if (!encoded) return null
    return JSON.parse(atob(encoded))
  } catch { return null }
}

// ── Realtime subscription (Supabase) ─────────────────────────────────────────
export function subscribeToCircle(circleId, onUpdate) {
  if (!isSupabaseConfigured()) return null
  const { url, key } = getSupabaseCredentials()
  const wsUrl = url.replace(/^https?/, u => u === 'https' ? 'wss' : 'ws') + '/realtime/v1/websocket?apikey=' + key
  let ws
  try {
    ws = new WebSocket(wsUrl)
    ws.onopen = () => ws.send(JSON.stringify({ topic:`realtime:public:circle_events:circle_id=eq.${circleId}`, event:'phx_join', payload:{}, ref:'1' }))
    ws.onmessage = msg => { try { const d=JSON.parse(msg.data); if(d.payload?.data) onUpdate(d.payload.data) } catch {} }
    ws.onerror = () => {}
  } catch {}
  return { unsubscribe: () => { try { ws?.close() } catch {} } }
}
