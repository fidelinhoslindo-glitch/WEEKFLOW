import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { CIRCLE_MODES, loadCircles, saveCircles, generateCircleInviteLink } from '../utils/flowCircle'
import { isSupabaseConfigured, sb, getSupabaseCredentials } from '../utils/supabase'
import CollisionDetector from '../components/flowcircle/CollisionDetector'
import CirclePulse from '../components/flowcircle/CirclePulse'
import FreeWindow from '../components/flowcircle/FreeWindow'
import FlowStreak from '../components/flowcircle/FlowStreak'
import UpgradeModal from '../components/UpgradeModal'

function StatusDot({ status }) {
  const c = { online:'bg-emerald-500', away:'bg-amber-400', busy:'bg-red-500', offline:'bg-slate-400' }
  return <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${c[status]||c.offline}`} />
}

function MemberAvatar({ member, size=44 }) {
  return (
    <div className="relative inline-block">
      <div className="rounded-full flex items-center justify-center text-white font-black border-2 border-white dark:border-slate-800 shadow-md"
        style={{width:size,height:size,backgroundColor:member.avatar||'#6467f2',fontSize:size*0.36}}>
        {member.name.charAt(0).toUpperCase()}
      </div>
      <StatusDot status={member.status}/>
    </div>
  )
}

function Roda({ circle, onMemberClick }) {
  const members = circle.members||[]
  const mode = CIRCLE_MODES[circle.mode]
  const r=110, center=140
  return (
    <div className="relative mx-auto" style={{width:center*2,height:center*2}}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${center*2} ${center*2}`}>
        <defs>
          <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6467f2"/><stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={r} fill="none" stroke="url(#rg2)" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4"/>
        {members.map((m,i)=>{const a=(i/members.length)*2*Math.PI-Math.PI/2;return<line key={m.id} x1={center} y1={center} x2={center+r*Math.cos(a)} y2={center+r*Math.sin(a)} stroke={m.avatar||'#6467f2'} strokeWidth="1" opacity="0.2"/>})}
      </svg>
      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-2xl"
        style={{width:72,height:72,left:center-36,top:center-36,background:`linear-gradient(135deg,${circle.color||'#6467f2'},#8b5cf6)`,boxShadow:`0 8px 32px ${circle.color||'#6467f2'}60`}}>
        <span className="text-2xl">{mode?.icon}</span>
        <span className="text-[9px] font-black opacity-80">{members.length}p</span>
      </div>
      {members.map((m,i)=>{
        const a=(i/members.length)*2*Math.PI-Math.PI/2
        return(
          <button key={m.id} onClick={()=>onMemberClick(m)}
            className="absolute flex flex-col items-center gap-1 hover:scale-110 transition-transform"
            style={{left:center+r*Math.cos(a)-24,top:center+r*Math.sin(a)-24,width:48}}>
            <MemberAvatar member={m} size={40}/>
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 truncate w-full text-center">{m.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function CreateModal({ onClose, onCreate }) {
  const [form,setForm]=useState({mode:'',name:'',color:'#6467f2'})
  const COLORS=['#6467f2','#ec4899','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#06b6d4']
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-lg">Create New Circle</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(CIRCLE_MODES).map(([key,mode])=>(
              <button key={key} onClick={()=>setForm(f=>({...f,mode:key}))}
                className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${form.mode===key?'border-primary bg-primary/5':'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}>
                <span className="text-2xl">{mode.icon}</span>
                <p className="text-sm font-black">{mode.label}</p>
                <p className="text-[10px] text-slate-500 leading-snug">{mode.description}</p>
              </button>
            ))}
          </div>
          {form.mode&&(
            <>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Circle Name</label>
                <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="Give your circle a name..."
                  value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(col=>(
                    <button key={col} onClick={()=>setForm(f=>({...f,color:col}))}
                      className={`w-8 h-8 rounded-full hover:scale-110 transition-all ${form.color===col?'ring-2 ring-offset-2 ring-slate-400 scale-110':''}`}
                      style={{backgroundColor:col}}/>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">Cancel</button>
          <button onClick={()=>{if(form.mode&&form.name.trim()){onCreate(form);onClose()}}} disabled={!form.mode||!form.name.trim()}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">
            Create Circle
          </button>
        </div>
      </div>
    </div>
  )
}


function EventCard({ ev, onDelete, onPin }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-shadow">
      {ev.image && (
        <div className="relative h-36 overflow-hidden cursor-pointer" onClick={()=>setExpanded(x=>!x)}>
          <img src={ev.image} alt="" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
          <span className="absolute bottom-2 left-3 text-white font-black text-base drop-shadow">{ev.emoji||'📅'} {ev.title}</span>
        </div>
      )}
      <div className="flex items-start gap-3 p-4">
        <div className="w-1 self-stretch rounded-full shrink-0 mt-0.5" style={{backgroundColor:ev.color||'#6467f2',minHeight:32}}/>
        {!ev.image && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{backgroundColor:(ev.color||'#6467f2')+'22'}}>
            {ev.emoji||'📅'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {!ev.image && <p className="font-black text-sm">{ev.title}</p>}
          <p className="text-xs text-slate-400 mt-0.5">
            {ev.date} · {ev.time} · {ev.duration}min
            {ev.createdBy && <span className="ml-1">· by {ev.createdBy}</span>}
          </p>
          {ev.note && (
            <p className={`text-xs text-slate-500 mt-1.5 leading-relaxed ${!expanded&&'line-clamp-2'}`}>{ev.note}</p>
          )}
          {ev.note && ev.note.length > 80 && (
            <button onClick={()=>setExpanded(x=>!x)} className="text-[10px] text-primary font-semibold mt-0.5">
              {expanded?'Show less':'Read more'}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={()=>onPin(ev.id)}
            className={`p-1.5 rounded-lg transition-all ${ev.pinned?'text-amber-400 bg-amber-50 dark:bg-amber-900/20':'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm" style={ev.pinned?{fontVariationSettings:"'FILL' 1"}:{}}>push_pin</span>
          </button>
          <button onClick={()=>onDelete(ev.id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-300 hover:text-red-400 transition-all">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FlowCirclePage() {
  const {pushToast,user,planLimits,isPro,pendingCircleInvite,setPendingCircleInvite,notifications,setNotifications,sendPushNotification} = useApp()
  const sbToken = typeof window!=='undefined'?localStorage.getItem('wf_token'):null
  // user.id may be missing if saved before id was stored — decode from JWT as fallback
  const userId = user?.id || (() => { try { const t=localStorage.getItem('wf_token'); if(!t)return null; return JSON.parse(atob(t.split('.')[1])).sub||null } catch { return null } })()
  const [circles,setCircles]         = useState(loadCircles)
  const [activeId,setActiveId]       = useState(()=>loadCircles()[0]?.id||null)
  const [showCreate,setShowCreate]   = useState(false)
  const [showUpgrade,setShowUpgrade] = useState(false)
  const [activeTab,setActiveTab]     = useState('roda')
  const [inviteEmail,setInviteEmail] = useState('')
  const [inviteLink,setInviteLink]   = useState('')
  const [copied,setCopied]           = useState(false)
  const [syncing,setSyncing]         = useState(false)
  const [newEvTitle,setNewEvTitle]   = useState('')
  const [showEvModal,setShowEvModal] = useState(false)
  const [showCircleList,setShowCircleList] = useState(false) // mobile sidebar toggle
  const [evForm,setEvForm]           = useState({ title:'', date: new Date().toISOString().split('T')[0], time:'18:00', duration:60, color:'#6467f2', emoji:'📅', note:'', image:null, pinned:false })

  const circle = circles.find(c=>c.id===activeId)
  const mode   = circle?CIRCLE_MODES[circle.mode]:null
  const persist = useCallback((u)=>{setCircles(u);saveCircles(u)},[])

  // Trigger to force a re-sync after joining a circle
  const [syncTrigger, setSyncTrigger] = useState(0)

  // ── Sync from Supabase ──
  useEffect(()=>{
    if(!isSupabaseConfigured()||!sbToken||!userId)return
    setSyncing(true)
    // RLS ensures user only sees circles they own or are a member of
    sb.circles.list(sbToken).then(async(rawCircles)=>{
      // For each circle, fetch members + events (RLS filters automatically)
      const allCircles = await Promise.all((rawCircles||[]).map(async c=>{
        const [members, events] = await Promise.all([
          sb.circles.members(sbToken, c.id).catch(()=>[]),
          sb.circles.events(sbToken, c.id).catch(()=>[])
        ])
        return {...c,members,events}
      }))
      if(allCircles.length>0){
        const demos = loadCircles().filter(c=>c.id.startsWith('circle_demo_'))
        persist([...demos,...allCircles])
        // Ensure active circle is set if not already pointing to a valid one
        setActiveId(prev => {
          const ids = allCircles.map(c=>c.id)
          if(prev && ids.includes(prev)) return prev
          return allCircles[0]?.id || prev
        })
      }
    }).catch(()=>{}).finally(()=>setSyncing(false))
  },[sbToken,userId,syncTrigger])

  // Invite check moved to AppContext (global — works on any page)

  // ── Handle join-circle link ──
  const joinCircle = async(invite)=>{
    const existing = circles.find(c=>c.id===invite.circleId)
    if(existing){
      setActiveId(existing.id)
      pushToast('You are already in this circle!','info')
      return
    }
    // Step 1: Add self as member first (RLS allows inserting own user_id)
    // After becoming a member, RLS grants read access to the circle
    if(isSupabaseConfigured()&&sbToken&&userId){
      await sb.circles.addMember(sbToken,{circle_id:invite.circleId,user_id:userId,name:user?.name||'You',role:'member',avatar:user?.avatarColor||'#6467f2',status:'online'}).catch((e)=>{ console.warn('addMember failed:', e.message) })
      // Mark invite as accepted (RLS allows recipient to update their own invites)
      const { url, key } = getSupabaseCredentials()
      await fetch(`${url}/rest/v1/circle_invites?circle_id=eq.${invite.circleId}&email=eq.${encodeURIComponent(user?.email||'')}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${sbToken}`},
        body:JSON.stringify({status:'accepted'})
      }).catch(()=>{})
    }
    // Step 2: Now fetch circle data (RLS allows since we're a member now)
    let circleData = null
    let members = []
    let events = []
    if(isSupabaseConfigured()&&sbToken){
      try {
        const [cData, mData, eData] = await Promise.all([
          sb.circles.list(sbToken).then(list=>list.find(c=>c.id===invite.circleId)||null),
          sb.circles.members(sbToken, invite.circleId),
          sb.circles.events(sbToken, invite.circleId)
        ])
        circleData = cData
        members = mData || []
        events = eData || []
      } catch {}
    }
    const nc={
      id:invite.circleId,
      mode:circleData?.mode||invite.mode||'friends',
      name:circleData?.name||invite.circleName,
      color:circleData?.color||'#6467f2',
      members,
      events,
      createdAt:circleData?.created_at||new Date().toISOString()
    }
    persist(prev => {
      if(prev.find(c=>c.id===nc.id)) return prev
      return [...prev, nc]
    })
    setActiveId(nc.id)
    // Trigger re-sync to get fresh data
    setTimeout(()=>setSyncTrigger(t=>t+1), 500)
    pushToast(`🎉 You joined "${nc.name}"!`,'success')
    setPendingCircleInvite(null)
  }

  // Auto-join when user accepts invite from Header modal (no second modal)
  useEffect(()=>{ if(pendingCircleInvite) joinCircle(pendingCircleInvite) },[pendingCircleInvite]) // eslint-disable-line

  const createCircle = async(f)=>{
    const nc={...f,id:'circ_'+Date.now(),members:[{id:userId||'me',name:user?.name||'You',role:'admin',avatar:user?.avatarColor||'#6467f2',status:'online'}],events:[],createdAt:new Date().toISOString()}
    persist([...circles,nc]);setActiveId(nc.id);setShowCircleList(false)
    if(isSupabaseConfigured()&&sbToken&&userId){
      try {
        await sb.circles.upsert(sbToken,{id:nc.id,owner_id:userId,mode:nc.mode,name:nc.name,color:nc.color,created_at:nc.createdAt})
        await sb.circles.addMember(sbToken,{circle_id:nc.id,user_id:userId,name:user?.name||'You',role:'admin',avatar:user?.avatarColor||'#6467f2',status:'online'}).catch(()=>{})
      } catch(err) {
        pushToast(`⚠️ Circle sync failed: ${err.message}`,'error')
      }
    }
    pushToast(`🎉 "${nc.name}" created!`,'success')
  }

  const deleteCircle = async(id)=>{
    const upd=circles.filter(c=>c.id!==id)
    persist(upd);setActiveId(upd[0]?.id||null)
    if(isSupabaseConfigured()&&sbToken)await sb.circles.delete(sbToken,id).catch(()=>{})
    pushToast('Circle deleted.','info')
  }

  const addEvent = async()=>{
    if(!circle||!newEvTitle.trim())return
    const ev={id:'ev_'+Date.now(),title:newEvTitle.trim(),date:new Date().toISOString().split('T')[0],time:'18:00',duration:60,shared:true,color:circle.color||'#6467f2',circle_id:circle.id}
    persist(circles.map(c=>c.id===circle.id?{...c,events:[...(c.events||[]),ev]}:c));setNewEvTitle('')
    if(isSupabaseConfigured()&&sbToken)await sb.circles.addEvent(sbToken,ev).catch(()=>{})
    pushToast('📅 Event added!','success')
  }

  const addEventFull = async()=>{
    if(!circle||!evForm.title.trim())return
    const ev={
      id:'ev_'+Date.now(),title:evForm.title.trim(),date:evForm.date,time:evForm.time,
      duration:Number(evForm.duration),color:evForm.color,emoji:evForm.emoji,
      note:evForm.note.trim(),image:evForm.image,pinned:evForm.pinned,
      createdBy:user?.name||'You',shared:true,circle_id:circle.id,
    }
    persist(circles.map(c=>c.id===circle.id?{...c,events:[...(c.events||[]),ev]}:c))
    if(isSupabaseConfigured()&&sbToken)await sb.circles.addEvent(sbToken,ev).catch(()=>{})
    pushToast('Event created!','success')
    setShowEvModal(false)
    setEvForm({ title:'', date:new Date().toISOString().split('T')[0], time:'18:00', duration:60, color:'#6467f2', emoji:'📅', note:'', image:null, pinned:false })
  }

  const togglePin = (eid)=>{
    persist(circles.map(c=>c.id===circle.id?{...c,events:(c.events||[]).map(e=>e.id===eid?{...e,pinned:!e.pinned}:e)}:c))
  }

  const deleteEvent = async(eid)=>{
    persist(circles.map(c=>c.id===circle.id?{...c,events:(c.events||[]).filter(e=>e.id!==eid)}:c))
    if(isSupabaseConfigured()&&sbToken)await sb.circles.deleteEvent(sbToken,eid).catch(()=>{})
  }

  const sendInvite = async()=>{
    if(!inviteEmail.trim()||!circle)return
    const link=generateCircleInviteLink(circle.id,circle.name,circle.mode)
    setInviteLink(link)
    if(isSupabaseConfigured()&&sbToken){
      // Store invite in Supabase — invitee will see it as notification
      // RLS allows circle members to insert invites for their circle
      try {
        // Ensure circle exists in Supabase before inserting invite (FK constraint)
        await sb.circles.upsert(sbToken,{id:circle.id,owner_id:userId,mode:circle.mode,name:circle.name,color:circle.color||'#6467f2',created_at:circle.createdAt||new Date().toISOString()}).catch(()=>{})
        // Also ensure owner is a member
        await sb.circles.addMember(sbToken,{circle_id:circle.id,user_id:userId,name:user?.name||'You',role:'admin',avatar:user?.avatarColor||'#6467f2',status:'online'}).catch(()=>{})
        await sb.circles.invite(sbToken, { circle_id:circle.id, circle_name:circle.name, circle_mode:circle.mode, inviter_name:user?.name||'Someone', email:inviteEmail.trim(), status:'pending', created_at:new Date().toISOString() })
        // Add notification for inviter
        setNotifications(prev=>[{id:Date.now(),text:`📤 Invite sent to ${inviteEmail.trim()} for "${circle.name}"`,time:'just now',read:false},...prev.slice(0,9)])
        sendPushNotification('Invite Sent',`Invite sent to ${inviteEmail.trim()}`)
        pushToast(`📩 Invite sent to ${inviteEmail.trim()}!`,'success')
      } catch(err) {
        console.error('Invite failed:',err)
        pushToast(`❌ Invite failed: ${err.message}. Run the Setup SQL in Supabase first.`,'error')
      }
    } else {
      pushToast('🔗 Share this link with your friend!','info')
    }
    setInviteEmail('')
  }

  const copyLink = async()=>{
    try{await navigator.clipboard.writeText(inviteLink);setCopied(true);pushToast('🔗 Link copied!','success');setTimeout(()=>setCopied(false),2500)}catch{}
  }

  const voteOption = async(opt)=>{
    persist(circles.map(c=>c.id!==circle.id||!c.pendingPoll?c:{...c,pendingPoll:{...c.pendingPoll,votes:{...c.pendingPoll.votes,[opt]:(c.pendingPoll.votes[opt]||0)+1}}}))
    if(isSupabaseConfigured()&&sbToken&&userId)await sb.circles.vote(sbToken,{circle_id:circle.id,option:opt,user_id:userId}).catch(()=>{})
    pushToast(`Voted for "${opt}"! 🗳️`,'success')
  }

  const TABS = ['roda','events','members','invite']

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar/>
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="FlowCircle" subtitle={isSupabaseConfigured()?(syncing?'Syncing...':'Cloud synced ☁️'):'Local mode — connect Supabase for real-time sync'}/>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── Mobile circle selector bar ── */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
            <button onClick={()=>{ if(!isPro && circles.length >= planLimits.circles){ setShowUpgrade(true); return } setShowCreate(true) }}
              className="shrink-0 w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl text-sm">
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
            {circles.map(c=>{
              const active=activeId===c.id
              return(
                <button key={c.id} onClick={()=>{setActiveId(c.id);setActiveTab('roda')}}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${active?'bg-primary/10 text-primary':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <span className="text-lg">{CIRCLE_MODES[c.mode]?.icon}</span>
                  <span className="max-w-[100px] truncate">{c.name}</span>
                </button>
              )
            })}
            {circles.length===0&&<span className="text-xs text-slate-400 px-2">No circles yet</span>}
          </div>

          {/* ── Desktop circle sidebar ── */}
          <aside className="hidden md:flex w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <button onClick={()=>{ if(!isPro && circles.length >= planLimits.circles){ setShowUpgrade(true); return } setShowCreate(true) }} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined text-sm">add</span> New Circle
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {circles.map(c=>{
                const m=CIRCLE_MODES[c.mode];const active=activeId===c.id
                return(
                  <button key={c.id} onClick={()=>{setActiveId(c.id);setActiveTab('roda')}}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${active?'bg-primary/10 border-2 border-primary/20':'hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-transparent'}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{background:`linear-gradient(135deg,${c.color||'#6467f2'}30,${c.color||'#8b5cf6'}20)`}}>
                      {m?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${active?'text-primary':''}`}>{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.members?.length||0} members</p>
                    </div>
                  </button>
                )
              })}
              {circles.length===0&&<div className="text-center py-8"><span className="text-4xl block mb-2">🔵</span><p className="text-xs text-slate-400">No circles yet</p></div>}
            </div>
          </aside>

          {/* ── Circle detail ── */}
          {circle&&mode?(
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {/* Circle header */}
              <div className={`px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 ${mode.bg}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl shrink-0">{mode.icon}</span>
                    <div className="min-w-0">
                      <h2 className="font-black text-base sm:text-lg truncate">{circle.name}</h2>
                      <p className={`text-xs font-semibold ${mode.text} truncate`}>{mode.label} · {circle.members?.length||0} members</p>
                    </div>
                  </div>
                  <button onClick={()=>deleteCircle(circle.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-400 shrink-0">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                {/* Tabs — scrollable on mobile */}
                <div className="flex gap-1 mt-3 overflow-x-auto pb-1 -mb-1">
                  {TABS.map(tab=>(
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap shrink-0 ${activeTab===tab?'bg-white dark:bg-slate-800 shadow-sm '+mode.text:'text-slate-500 hover:bg-white/50'}`}>
                      {tab==='roda'?'🔵 Roda':tab==='events'?'📅 Events':tab==='members'?'👥 Members':'✉️ Invite'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">

                {/* RODA */}
                {activeTab==='roda'&&(
                  <div className="space-y-6">
                    <FlowStreak circle={circle}/>
                    <CollisionDetector circle={circle}/>
                    <FreeWindow circle={circle} onCreateEvent={(ev) => {
                      const newEv = { id:'ev_'+Date.now(), title:ev.title, date:ev.date, time:ev.time, duration:ev.duration, shared:true, color:circle.color||'#6467f2', circle_id:circle.id }
                      persist(circles.map(c=>c.id===circle.id?{...c,events:[...(c.events||[]),newEv]}:c))
                    }}/>
                    <CirclePulse circle={circle}/>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
                        <Roda circle={circle} onMemberClick={m=>pushToast(`${m.name} is ${m.status}`,'info')}/>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        {circle.mode==='couple'&&circle.anniversary&&(
                          <div className={`p-4 rounded-2xl border ${mode.border} ${mode.bg}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💍</span>
                              <div><p className={`text-sm font-black ${mode.text}`}>Anniversary</p><p className="text-xs text-slate-500">{new Date(circle.anniversary).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p></div>
                            </div>
                          </div>
                        )}
                        {circle.pendingPoll&&(
                          <div className={`p-4 rounded-2xl border ${mode.border} ${mode.bg}`}>
                            <p className="font-black text-sm mb-3">🗳️ {circle.pendingPoll.question}</p>
                            <div className="space-y-2 mb-3">
                              {circle.pendingPoll.options.map(opt=>{
                                const v=circle.pendingPoll.votes[opt]||0,t=Object.values(circle.pendingPoll.votes).reduce((a,b)=>a+b,0)||1
                                return(<div key={opt} className="flex items-center gap-3">
                                  <span className="text-xs font-semibold w-16">{opt}</span>
                                  <div className="flex-1 h-2 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{width:`${(v/t)*100}%`,backgroundColor:circle.color||'#6467f2'}}/>
                                  </div>
                                  <span className="text-xs text-slate-500 w-8">{v}v</span>
                                </div>)
                              })}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {circle.pendingPoll.options.map(opt=>(
                                <button key={opt} onClick={()=>voteOption(opt)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mode.text} ${mode.bg} border ${mode.border} hover:opacity-80`}>
                                  Vote: {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Members</p>
                          <div className="space-y-3">
                            {circle.members?.map(m=>(
                              <div key={m.id} className="flex items-center gap-3">
                                <MemberAvatar member={m} size={38}/>
                                <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{m.name}</p><p className="text-[10px] text-slate-400 capitalize">{m.role} · {m.status}</p></div>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${m.status==='online'?'bg-emerald-100 text-emerald-700':m.status==='busy'?'bg-red-100 text-red-700':'bg-slate-100 text-slate-500'}`}>{m.status}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EVENTS */}
                {activeTab==='events'&&(
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                        placeholder="Quick add event title..." value={newEvTitle} onChange={e=>setNewEvTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addEvent()}/>
                      <div className="flex gap-2">
                        <button onClick={addEvent} disabled={!newEvTitle.trim()} className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40">Quick</button>
                        <button onClick={()=>setShowEvModal(true)} className="flex-1 sm:flex-none px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                          New
                        </button>
                      </div>
                    </div>

                    {(circle.events||[]).some(e=>e.pinned)&&(
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>push_pin</span>
                          Pinned
                        </p>
                        <div className="space-y-2">
                          {(circle.events||[]).filter(e=>e.pinned).map(ev=><EventCard key={ev.id} ev={ev} onDelete={deleteEvent} onPin={togglePin}/>)}
                        </div>
                      </div>
                    )}

                    {(circle.events||[]).filter(e=>!e.pinned).length===0&&!(circle.events||[]).some(e=>e.pinned)?(
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="font-black text-slate-400 mb-1">No events yet</p>
                        <p className="text-xs text-slate-400">Create one with images, notes and a custom color</p>
                      </div>
                    ):(
                      (circle.events||[]).filter(e=>!e.pinned).length>0&&(
                        <div>
                          {(circle.events||[]).some(e=>e.pinned)&&(
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">All Events</p>
                          )}
                          <div className="space-y-3">
                            {(circle.events||[]).filter(e=>!e.pinned).map(ev=><EventCard key={ev.id} ev={ev} onDelete={deleteEvent} onPin={togglePin}/>)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* MEMBERS */}
                {activeTab==='members'&&(
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {circle.members?.map(m=>(
                      <div key={m.id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <MemberAvatar member={m} size={48}/>
                        <div className="flex-1 min-w-0"><p className="font-bold truncate">{m.name}</p><p className="text-xs text-slate-400 capitalize">{m.role}</p></div>
                        <div className={`px-2 py-1 rounded-full text-[10px] font-black shrink-0 ${m.status==='online'?'bg-emerald-100 text-emerald-700':m.status==='busy'?'bg-red-100 text-red-700':'bg-slate-100 text-slate-500'}`}>{m.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* INVITE */}
                {activeTab==='invite'&&(
                  <div className="space-y-5 max-w-lg">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                      <h4 className="font-black mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">person_add</span>
                        Invite to {circle.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                          placeholder="friend@email.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendInvite()}/>
                        <button onClick={sendInvite} disabled={!inviteEmail.trim()} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40">Invite</button>
                      </div>
                      <button onClick={()=>setInviteLink(generateCircleInviteLink(circle.id,circle.name,circle.mode))}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">link</span> Generate shareable link
                      </button>
                      {inviteLink&&(
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">Share this link:</p>
                          <div className="flex gap-2 mb-2">
                            <input readOnly value={inviteLink} className="flex-1 text-xs font-mono bg-transparent focus:outline-none text-slate-500 truncate min-w-0"/>
                            <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${copied?'bg-emerald-500 text-white':'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                              {copied?'✓ Copied!':'Copy'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <a href={`https://wa.me/?text=${encodeURIComponent('Join my '+circle.name+' on WeekFlow! '+inviteLink)}`} target="_blank" rel="noopener"
                              className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 rounded-lg text-xs font-bold hover:opacity-80">WhatsApp</a>
                            <a href={`mailto:?subject=Join my WeekFlow circle&body=Join my ${circle.name}: ${inviteLink}`}
                              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 rounded-lg text-xs font-bold hover:opacity-80">Email</a>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">Your friend clicks this link to join your circle.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ):(
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-6 sm:p-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl sm:text-5xl">🔵</div>
              <div><h3 className="text-xl sm:text-2xl font-black mb-2">Welcome to FlowCircle</h3><p className="text-slate-400 max-w-md text-sm">Create a circle to plan together with your partner, friends, family or team.</p></div>
              <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                {Object.entries(CIRCLE_MODES).map(([key,m])=>(
                  <button key={key} onClick={()=>setShowCreate(true)} className={`flex flex-col gap-2 p-3 sm:p-4 rounded-2xl border-2 ${m.border} ${m.bg} hover:shadow-md transition-all text-left`}>
                    <span className="text-xl sm:text-2xl">{m.icon}</span><p className={`text-xs sm:text-sm font-black ${m.text}`}>{m.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showCreate&&<CreateModal onClose={()=>setShowCreate(false)} onCreate={createCircle}/>}
      {showUpgrade&&<UpgradeModal feature="múltiplos FlowCircles" onClose={()=>setShowUpgrade(false)}/>}

      {/* ── New Event Modal ── */}
      {showEvModal&&circle&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="font-black text-lg">New Event</h3>
              <button onClick={()=>setShowEvModal(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              <div>
                {evForm.image?(
                  <div className="relative rounded-2xl overflow-hidden h-40 group">
                    <img src={evForm.image} alt="" className="w-full h-full object-cover"/>
                    <button onClick={()=>setEvForm(f=>({...f,image:null}))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ):(
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-primary transition-colors group">
                    <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                    <span className="text-xs text-slate-400 mt-1 font-medium">Add cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e=>{
                      const file=e.target.files?.[0];if(!file)return
                      const reader=new FileReader();reader.onload=ev=>setEvForm(f=>({...f,image:ev.target.result}));reader.readAsDataURL(file)
                    }}/>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Category</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['📅','🎉','🍕','🎬','🏃','🎮','🎂','✈️','🎵','💼','🏠','🤝'].map(em=>(
                    <button key={em} onClick={()=>setEvForm(f=>({...f,emoji:em}))}
                      className={`w-9 h-9 rounded-xl text-lg transition-all hover:scale-110 ${evForm.emoji===em?'bg-primary/10 ring-2 ring-primary scale-110':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Title *</label>
                <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="What's happening?" value={evForm.title} onChange={e=>setEvForm(f=>({...f,title:e.target.value}))}/>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Date</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={evForm.date} onChange={e=>setEvForm(f=>({...f,date:e.target.value}))}/>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Time</label>
                  <input type="time" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={evForm.time} onChange={e=>setEvForm(f=>({...f,time:e.target.value}))}/>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Duration</label>
                  <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                    value={evForm.duration} onChange={e=>setEvForm(f=>({...f,duration:e.target.value}))}>
                    {[30,60,90,120,180,240,480].map(d=><option key={d} value={d}>{d<60?d+'min':d/60+'h'}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Color</label>
                <div className="flex gap-2">
                  {['#6467f2','#ec4899','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#06b6d4'].map(col=>(
                    <button key={col} onClick={()=>setEvForm(f=>({...f,color:col}))}
                      className={`w-8 h-8 rounded-full hover:scale-110 transition-all ${evForm.color===col?'ring-2 ring-offset-2 ring-slate-400 scale-110':''}`}
                      style={{backgroundColor:col}}/>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Note (optional)</label>
                <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  rows={2} placeholder="Any details, address, link..."
                  value={evForm.note} onChange={e=>setEvForm(f=>({...f,note:e.target.value}))}/>
              </div>

              <button onClick={()=>setEvForm(f=>({...f,pinned:!f.pinned}))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${evForm.pinned?'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600':'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-amber-400/50'}`}>
                <span className="material-symbols-outlined text-sm" style={evForm.pinned?{fontVariationSettings:"'FILL' 1"}:{}}>push_pin</span>
                {evForm.pinned?'Pinned — will show at top':'Pin this event'}
              </button>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button onClick={()=>setShowEvModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">Cancel</button>
              <button onClick={addEventFull} disabled={!evForm.title.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
