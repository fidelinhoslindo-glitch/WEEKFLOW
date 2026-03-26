import { useState, useEffect } from 'react'

const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const SB_SERVICE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Admin emails — only these can access the admin panel
const ADMIN_EMAILS = ['gufidelis116@gmail.com', 'admin@weekflow.app', 'weekflowspace@outlook.com']

function isAdmin(email) { return ADMIN_EMAILS.includes(email?.toLowerCase()) }

export default function AdminPage() {
  // Self-contained admin auth — independent of app login
  const [adminToken, setAdminToken] = useState(null)
  const [adminEmail, setAdminEmail] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [updating,  setUpdating]  = useState(null)
  const [stats,     setStats]     = useState({ total:0, pro:0, business:0, free:0, thisMonth:0 })
  const [activeTab, setActiveTab] = useState('users')
  const [toast, setToast] = useState(null)

  const pushToast = (msg, type='info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const navigate = (to) => { window.location.href = to === 'landing' ? '/' : `/${to}` }

  // Admin login
  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoginErr('')
    setLoginLoading(true)
    try {
      if (!SB_URL || !SB_KEY) throw new Error('Supabase not configured')
      const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPass })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error_description || d.msg || d.error || 'Login failed')
      if (!isAdmin(d.user?.email)) throw new Error('This account is not an admin.')
      setAdminToken(d.access_token)
      setAdminEmail(d.user.email)
    } catch (err) {
      setLoginErr(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  // Supabase fetch using admin token
  async function sbFetch(path, opts = {}) {
    if (!adminToken || !SB_URL || !SB_KEY) throw new Error('Not authenticated')
    const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_SERVICE || SB_KEY,
        'Authorization': `Bearer ${SB_SERVICE || adminToken}`,
        'Prefer': 'return=representation',
        ...(opts.headers || {}),
      },
    })
    const text = await res.text()
    if (!res.ok) {
      const err = text ? JSON.parse(text) : {}
      throw new Error(err.message || err.hint || `HTTP ${res.status}`)
    }
    return text ? JSON.parse(text) : []
  }

  // Load users when authenticated
  useEffect(() => { if (adminToken) loadUsers() }, [adminToken])

  // Show login form if not authenticated
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleAdminLogin} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-sm shadow-xl">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>admin_panel_settings</span>
          </div>
          <h2 className="text-xl font-black text-center mb-1">Admin Panel</h2>
          <p className="text-sm text-slate-400 text-center mb-6">Sign in with an admin account</p>
          {loginErr && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 font-medium">{loginErr}</div>
          )}
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Email</label>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="admin@weekflow.app" />
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Password</label>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••" />
          <button type="submit" disabled={loginLoading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  async function loadUsers() {
    setLoading(true)
    try {
      // 1. Fetch all users from Supabase Auth Admin API (has email, metadata)
      const authKey = SB_SERVICE || SB_KEY
      const authRes = await fetch(`${SB_URL}/auth/v1/admin/users?per_page=1000`, {
        headers: {
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
        },
      })
      if (!authRes.ok) {
        const errText = await authRes.text()
        throw new Error(`Auth API ${authRes.status}: ${errText}`)
      }
      const authData = await authRes.json()
      const authUsers = Array.isArray(authData) ? authData : (authData.users || [])

      // 2. Fetch profiles table (has plan, avatar_color, etc.)
      let profiles = []
      try {
        profiles = await sbFetch('profiles?select=*')
        if (!Array.isArray(profiles)) profiles = []
      } catch { /* profiles table might not exist yet */ }

      // 3. Merge: auth users + profile data
      const profileMap = {}
      profiles.forEach(p => { profileMap[p.id] = p })

      const merged = authUsers.map(u => {
        const profile = profileMap[u.id] || {}
        return {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.user_metadata?.full_name || profile.name || '',
          plan: profile.plan || 'Free',
          avatar_color: profile.avatar_color || '#6467f2',
          created_at: u.created_at || profile.created_at || '',
          last_sign_in: u.last_sign_in_at || '',
          provider: u.app_metadata?.provider || 'email',
        }
      })

      setUsers(merged)
      const pro  = merged.filter(u => u.plan === 'Pro').length
      const biz  = merged.filter(u => u.plan === 'Business').length
      const thisMonth = merged.filter(u => {
        const d = new Date(u.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length
      setStats({ total: merged.length, pro, business: biz, free: merged.length - pro - biz, thisMonth })
    } catch(e) {
      console.error('Admin loadUsers error:', e)
      pushToast(`Could not load users: ${e.message || 'Check Supabase connection.'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function setPlan(userId, plan) {
    setUpdating(userId)
    try {
      // Upsert profile — creates row if it doesn't exist
      await sbFetch(`profiles?on_conflict=id`, {
        method: 'POST',
        body: JSON.stringify({ id: userId, plan }),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      })
      setUsers(u => u.map(x => x.id === userId ? { ...x, plan } : x))
      // Recalculate stats after plan change
      setStats(s => {
        const oldPlan = users.find(u => u.id === userId)?.plan || 'Free'
        const counts = { ...s }
        // Decrement old
        if (oldPlan === 'Pro') counts.pro--
        else if (oldPlan === 'Business') counts.business--
        else counts.free--
        // Increment new
        if (plan === 'Pro') counts.pro++
        else if (plan === 'Business') counts.business++
        else counts.free++
        return counts
      })
      pushToast(`Plan updated to ${plan}!`, 'success')
    } catch(e) {
      pushToast(`Failed to update plan: ${e.message}`, 'error')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type==='success'?'bg-emerald-500 text-white':toast.type==='error'?'bg-red-500 text-white':'bg-slate-800 text-white'}`}>
          {toast.msg}
        </div>
      )}
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black">Admin Panel</h1>
              <p className="text-xs text-slate-400">{adminEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
            <span className="text-xs text-slate-400 font-medium">Live</span>
            <button onClick={loadUsers} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl ml-2">
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
            <button onClick={() => { setAdminToken(null); setAdminEmail(null) }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl ml-1" title="Logout">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label:'Total Users',    value: stats.total,     icon:'group',         color:'text-primary bg-primary/10' },
            { label:'Business',       value: stats.business,  icon:'business',      color:'text-purple-600 bg-purple-100 dark:bg-purple-900/20' },
            { label:'Pro Users',      value: stats.pro,       icon:'workspace_premium', color:'text-amber-600 bg-amber-100 dark:bg-amber-900/20' },
            { label:'Free Users',     value: stats.free,      icon:'person',        color:'text-slate-600 bg-slate-100 dark:bg-slate-800' },
            { label:'New This Month', value: stats.thisMonth, icon:'trending_up',   color:'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
              </div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['users', 'stats'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab===tab?'bg-primary text-white':'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/30'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <>
            {/* Search */}
            <div className="flex gap-3 mb-5">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
                <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                <input className="bg-transparent text-sm focus:outline-none flex-1" placeholder="Search users..."
                  value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500">
                {filtered.length} users
              </div>
            </div>

            {/* Users table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <p className="col-span-1 text-xs font-black uppercase tracking-wider text-slate-400">#</p>
                <p className="col-span-4 text-xs font-black uppercase tracking-wider text-slate-400">User</p>
                <p className="col-span-3 text-xs font-black uppercase tracking-wider text-slate-400">Joined</p>
                <p className="col-span-2 text-xs font-black uppercase tracking-wider text-slate-400">Plan</p>
                <p className="col-span-2 text-xs font-black uppercase tracking-wider text-slate-400">Actions</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="animate-spin material-symbols-outlined text-primary text-3xl">refresh</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">search_off</span>
                  <p className="text-slate-400">{search ? 'No users found' : 'No users yet'}</p>
                </div>
              ) : (
                filtered.map((u, i) => (
                  <div key={u.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors`}>
                    <p className="col-span-1 text-sm text-slate-400 font-mono">{i+1}</p>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                        style={{backgroundColor: u.avatar_color || '#6467f2'}}>
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{u.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email || u.id?.slice(0,8)+'...'}</p>
                      </div>
                    </div>
                    <p className="col-span-3 text-xs text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : '—'}
                    </p>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                        u.plan==='Business' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : u.plan==='Pro' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {u.plan==='Business' && <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>business</span>}
                        {u.plan==='Pro' && <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>workspace_premium</span>}
                        {u.plan || 'Free'}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-1 flex-wrap">
                      {u.plan !== 'Business' && (
                        <button onClick={() => setPlan(u.id, 'Business')} disabled={updating===u.id}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] font-bold hover:bg-purple-200 transition-all disabled:opacity-50">
                          {updating===u.id ? '...' : '→ Biz'}
                        </button>
                      )}
                      {u.plan !== 'Pro' && (
                        <button onClick={() => setPlan(u.id, 'Pro')} disabled={updating===u.id}
                          className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-200 transition-all disabled:opacity-50">
                          {updating===u.id ? '...' : '→ Pro'}
                        </button>
                      )}
                      {u.plan !== 'Free' && u.plan && (
                        <button onClick={() => setPlan(u.id, 'Free')} disabled={updating===u.id}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50">
                          {updating===u.id ? '...' : '→ Free'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-black mb-5">Plan Distribution</h3>
              <div className="space-y-4">
                {[{label:'Business', value:stats.business, color:'bg-purple-500'}, {label:'Pro', value:stats.pro, color:'bg-amber-400'}, {label:'Free', value:stats.free, color:'bg-slate-200 dark:bg-slate-700'}].map(p => (
                  <div key={p.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{p.label}</span>
                      <span className="text-slate-400">{p.value} ({stats.total?Math.round((p.value/stats.total)*100):0}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.color}`} style={{width:`${stats.total?(p.value/stats.total)*100:0}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-black mb-5">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label:'Upgrade all users to Pro', icon:'workspace_premium', color:'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
                    action: async () => {
                      for(const u of users.filter(u=>u.plan!=='Pro')) await setPlan(u.id,'Pro')
                      pushToast('All users upgraded to Pro!','success')
                    }},
                  { label:'Export user list (CSV)', icon:'download', color:'text-primary bg-primary/10',
                    action: () => {
                      const csv = ['Name,Email,Plan,Joined', ...users.map(u=>`${u.name},${u.email||''},${u.plan||'Free'},${u.created_at||''}}`)].join('\n')
                      const a = document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download='weekflow-users.csv'; a.click()
                      pushToast('CSV exported!','success')
                    }},
                  { label:'Refresh user data', icon:'refresh', color:'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                    action: loadUsers },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left">
                    <span className={`p-2 rounded-lg material-symbols-outlined text-sm ${a.color}`}>{a.icon}</span>
                    <span className="text-sm font-semibold">{a.label}</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm ml-auto">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
