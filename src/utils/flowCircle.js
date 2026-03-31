// ─── FlowCircle Utilities ─────────────────────────────────────────────────────

const LS_CIRCLES = 'wf_circles'

export const CIRCLE_MODES = {
  couple:  { label:'Casal 💑',         icon:'💑', color:'from-pink-500 to-rose-500',     bg:'bg-pink-50 dark:bg-pink-900/20',     border:'border-pink-200 dark:border-pink-800',     text:'text-pink-600 dark:text-pink-300',     maxMembers:2,   description:'Sincronize sua rotina com seu parceiro(a)' },
  friends: { label:'Amigos 👥',         icon:'👥', color:'from-blue-500 to-cyan-500',     bg:'bg-blue-50 dark:bg-blue-900/20',     border:'border-blue-200 dark:border-blue-800',     text:'text-blue-600 dark:text-blue-300',     maxMembers:12,  description:'Planeje encontros e alinhe agendas com amigos' },
  family:  { label:'Família 👨‍👩‍👧‍👦',  icon:'👨‍👩‍👧‍👦', color:'from-emerald-500 to-green-500', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800', text:'text-emerald-600 dark:text-emerald-300', maxMembers:20, description:'Organize a rotina de toda a família' },
  company: { label:'Empresa 🏢',        icon:'🏢', color:'from-violet-500 to-indigo-500', bg:'bg-violet-50 dark:bg-violet-900/20',   border:'border-violet-200 dark:border-violet-800',   text:'text-violet-600 dark:text-violet-300',   maxMembers:100, description:'Escala, projetos e calendário de equipe' },
}

const DEMO = []

export function loadCircles()  { try { const v=localStorage.getItem(LS_CIRCLES); return v?JSON.parse(v):DEMO } catch { return DEMO } }
export function saveCircles(c) { try { localStorage.setItem(LS_CIRCLES,JSON.stringify(c)) } catch {} }

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
