// ─── Supabase Integration for WeekFlow v15 ────────────────────────────────────
const VITE_URL = import.meta.env.VITE_SUPABASE_URL      || ''
const VITE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function getSbUrl() { return VITE_URL || localStorage.getItem('wf_sb_url') || '' }
function getSbKey() { return VITE_KEY || localStorage.getItem('wf_sb_key') || '' }

export const SUPABASE_URL      = VITE_URL
export const SUPABASE_ANON_KEY = VITE_KEY
export const SUPABASE_ENABLED  = !!(VITE_URL && VITE_KEY)

export function isSupabaseConfigured()          { return !!(getSbUrl() && getSbKey()) }
export function saveSupabaseCredentials(url, key) { localStorage.setItem('wf_sb_url', url); localStorage.setItem('wf_sb_key', key) }
export function getSupabaseCredentials()        { return { url: getSbUrl(), key: getSbKey() } }

export const SETUP_SQL = `
create table if not exists public.tasks (
  id bigint primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, category text default 'Work',
  day text not null, time text default '09:00',
  duration int default 60, completed boolean default false,
  priority text default 'medium', notes text default '',
  recurring boolean default false, color text default '',
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "own tasks" on public.tasks for all using (auth.uid() = user_id);

create table if not exists public.notes (
  id bigint primary key, user_id uuid references auth.users(id) on delete cascade not null,
  type text default 'note', title text default '', content text default '',
  color text default 'default', pinned boolean default false,
  todos jsonb default '[]', created_at timestamptz default now()
);
alter table public.notes enable row level security;
create policy "own notes" on public.notes for all using (auth.uid() = user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  plan text default 'Free',
  plan_expires_at timestamptz,
  plan_billing text default 'monthly',
  avatar_color text default '#6467f2', dark_mode boolean default false,
  onboarding jsonb default '{}', created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);
`

function headers(token) {
  const key = getSbKey()
  return { 'Content-Type':'application/json', 'apikey':key, 'Authorization':`Bearer ${token||key}`, 'Prefer':'return=representation' }
}

async function api(path, opts={}, token) {
  const url = getSbUrl()
  if (!url) throw new Error('Supabase not configured')
  const res = await fetch(`${url}/rest/v1/${path}`, { ...opts, headers: headers(token) })
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.message||`HTTP ${res.status}`) }
  const t = await res.text(); return t ? JSON.parse(t) : []
}

export async function supabaseSignIn(email, password) {
  const res = await fetch(`${getSbUrl()}/auth/v1/token?grant_type=password`, {
    method:'POST', headers:{'Content-Type':'application/json','apikey':getSbKey()},
    body: JSON.stringify({email,password})
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.error_description||'Sign in failed')
  return d
}

export async function supabaseSignUp(email, password, name) {
  const res = await fetch(`${getSbUrl()}/auth/v1/signup`, {
    method:'POST', headers:{'Content-Type':'application/json','apikey':getSbKey()},
    body: JSON.stringify({email,password,data:{name}})
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.error_description||d.msg||'Sign up failed')
  return d
}

export async function supabaseSignOut(token) {
  await fetch(`${getSbUrl()}/auth/v1/logout`, {
    method:'POST', headers:{'apikey':getSbKey(),'Authorization':`Bearer ${token}`}
  }).catch(()=>{})
}

export const sb = {
  tasks: {
    list:   (t)    => api('tasks?select=*&order=created_at.asc',{},t),
    upsert: (t,d)  => api('tasks?on_conflict=id',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'resolution=merge-duplicates,return=minimal'}},t).catch(()=>{}),
    delete: (t,id) => api(`tasks?id=eq.${id}`,{method:'DELETE'},t),
  },
  notes: {
    list:   (t)    => api('notes?select=*&order=created_at.desc',{},t),
    upsert: (t,d)  => api('notes?on_conflict=id',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'resolution=merge-duplicates,return=minimal'}},t).catch(()=>{}),
    delete: (t,id) => api(`notes?id=eq.${id}`,{method:'DELETE'},t),
  },
  profile: {
    get:    (t,uid) => api(`profiles?id=eq.${uid}&select=*`,{},t).then(r=>r[0]),
    upsert: (t,d)   => api('profiles?on_conflict=id',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'resolution=merge-duplicates,return=minimal'}},t).catch(()=>{}),
  },
  circles: {
    list:        (t)      => api('circles?select=*',{},t),
    upsert:      (t,d)    => api('circles?on_conflict=id',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'resolution=merge-duplicates,return=minimal'}},t).catch(()=>{}),
    delete:      (t,id)   => api(`circles?id=eq.${id}`,{method:'DELETE'},t),
    members:     (t,cid)  => api(`circle_members?circle_id=eq.${cid}&select=*`,{},t),
    addMember:   (t,d)    => api('circle_members',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'return=minimal'}},t).catch(()=>{}),
    events:      (t,cid)  => api(`circle_events?circle_id=eq.${cid}&select=*&order=date.asc`,{},t),
    addEvent:    (t,d)    => api('circle_events',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'return=representation'}},t),
    deleteEvent: (t,id)   => api(`circle_events?id=eq.${id}`,{method:'DELETE'},t),
    invite:      (t,d)    => api('circle_invites',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'return=representation'}},t),
    getInvite:   (token)  => api(`circle_invites?token=eq.${token}&select=*`).then(r=>r[0]),
    acceptInvite:(t,token)=> api(`circle_invites?token=eq.${token}`,{method:'PATCH',body:JSON.stringify({status:'accepted'})},t),
    vote:        (t,d)    => api('circle_poll_votes',{method:'POST',body:JSON.stringify(d),headers:{...headers(t),'Prefer':'return=minimal'}},t).catch(()=>{}),
    getVotes:    (t,cid)  => api(`circle_poll_votes?circle_id=eq.${cid}&select=*`,{},t),
  },
}
