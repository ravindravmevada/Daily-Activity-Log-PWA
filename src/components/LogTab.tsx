import { useState, useEffect, useRef, useCallback } from 'react'
import { useActivityStore } from '../store/activityStore'
import type { LocalActivity } from '../store/activityStore'
import { CATEGORIES, ACTIVITY_DONE_AT, ACTIVITY_LOGGED_FROM, ACTIVITY_LOGGED_VIA } from '../types/categories'
import { todayKey, dkey, keyToDate, fmtTS, fmtClock, fmtDur, uid, DOW, MON } from '../utils/helpers'

const STORAGE_KEY = 'dal-activities-v1'

const initForm = () => ({
  category: 'No Status',
  subcategory: 'No Status',
  activityDoneAt: 'No Status',
  activityType: 'Main' as 'Main' | 'Parallel',
  hasStartTimestamp: true,
  hasNotes: false,
  notes: '',
  loggedFrom: 'Daily Activity Log Web App (PWA)',
  loggedVia: 'Daily Activity Log Web App (PWA)',
})

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoDots  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
const IcoStop  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
const IcoLink  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const IcoTrash = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IcoEdit  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoNote  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IcoChevD = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
const IcoChevU = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
const IcoPlus  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoChevL = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
const IcoChevR = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
const IcoCopy  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
const IcoSun   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const IcoMoon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const IcoClock = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcoDrag  = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
const IcoDetach = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>

function buildPopupHtml(actId: string, isDark: boolean): string {
  const surface = isDark ? '#151B23' : '#FFFFFF'
  const border  = isDark ? '#2A3340' : '#E5E7EB'
  const text    = isDark ? '#E6EDF3' : '#111827'
  const subText = isDark ? '#8B98A9' : '#6B7280'
  const btnBg   = isDark ? '#1B2330' : '#F3F4F6'
  const btnHov  = isDark ? '#2A3340' : '#E5E7EB'
  const hdrBg   = isDark ? '#0D1117' : '#F9FAFB'
  const SC = '</' + 'script>'
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>⏱</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Segoe UI',sans-serif;background:${surface};color:${text};height:100vh;display:flex;flex-direction:column;overflow:hidden;user-select:none}
#hdr{background:${hdrBg};border-bottom:1px solid ${border};padding:7px 12px;display:flex;align-items:center;gap:8px}
#pulse{width:8px;height:8px;border-radius:50%;background:#3B82F6;flex-shrink:0;animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
#typelbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#3B82F6;flex:1;white-space:nowrap;overflow:hidden}
#cbtn{border:none;background:transparent;color:${subText};font-size:14px;cursor:pointer;padding:2px 5px;border-radius:4px}
#cbtn:hover{background:${btnBg}}
#bdy{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;overflow:hidden}
#clock{font-family:monospace;font-size:26px;font-weight:700;color:#3B82F6;letter-spacing:1px;white-space:nowrap;flex-shrink:0}
#info{flex:1;min-width:0}
#cat{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${text}}
#st{font-size:10px;font-family:monospace;color:${subText};margin-top:2px}
#rbtn{border:none;background:${btnBg};color:${subText};font-size:10px;font-weight:700;padding:7px 10px;border-radius:8px;cursor:pointer;flex-shrink:0;white-space:nowrap}
#rbtn:hover{background:${btnHov};color:${text}}
.par #pulse{background:#F59E0B}
.par #typelbl,.par #clock{color:#F59E0B}
</style></head><body>
<div id="hdr"><div id="pulse"></div><div id="typelbl">Main Activity</div><button id="cbtn" title="Toggle compact">⊟</button></div>
<div id="bdy"><div id="clock">00:00:00</div><div id="info"><div id="cat">Loading…</div><div id="st"></div></div><button id="rbtn">↩ Restore</button></div>
<script>
var ID='${actId}',KEY='dal-activities-v1',compact=false;
var ch=new BroadcastChannel('dal-timer-'+ID);
ch.addEventListener('message',function(e){if(e.data.type==='close'){ch.close();window.close();}});
document.getElementById('rbtn').onclick=function(){ch.postMessage({type:'restore'});ch.close();window.close();};
window.addEventListener('beforeunload',function(){ch.postMessage({type:'restore'});});
document.getElementById('cbtn').onclick=function(){
  compact=!compact;
  var bdy=document.getElementById('bdy'),info=document.getElementById('info'),rb=document.getElementById('rbtn'),clk=document.getElementById('clock');
  if(compact){window.resizeTo(190,52);bdy.style.padding='4px 8px';clk.style.fontSize='16px';info.style.display='none';rb.textContent='↩';rb.style.padding='4px 6px';this.textContent='⊞';}
  else{window.resizeTo(340,110);bdy.style.padding='';clk.style.fontSize='';info.style.display='';rb.textContent='↩ Restore';rb.style.padding='';this.textContent='⊟';}
};
function pad(n){return String(n).padStart(2,'0');}
function fmtClock(ms){var s=Math.floor(Math.abs(ms)/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor((s%3600)/60))+':'+pad(s%60);}
function getAct(){try{var days=JSON.parse(localStorage.getItem(KEY)||'{}');var ks=Object.keys(days);for(var i=0;i<ks.length;i++){var acts=days[ks[i]];for(var j=0;j<acts.length;j++){if(acts[j].id===ID)return acts[j];}}return null;}catch(e){return null;}}
function tick(){
  var a=getAct();if(!a||a.endMs!==null){window.close();return;}
  var el=Date.now()-a.startMs;
  document.getElementById('clock').textContent=fmtClock(el);
  document.title=fmtClock(el)+' ⏱';
  if(a.activityType==='Parallel')document.body.classList.add('par');else document.body.classList.remove('par');
  document.getElementById('typelbl').textContent=(a.activityType==='Main'?'Main':'Parallel')+' Activity';
  document.getElementById('cat').textContent=a.category+(a.subcategory!=='No Status'?' › '+a.subcategory:'');
  if(a.startMs>0){var d=new Date(a.startMs);var h=d.getHours();var ap=h>=12?'PM':'AM';h=h%12||12;document.getElementById('st').textContent='Started '+pad(h)+':'+pad(d.getMinutes())+' '+ap;}
}
tick();setInterval(tick,1000);
${SC}</body></html>`
}

interface Props { userEmail: string; onSignOut: () => void; dark: boolean; onToggleDark: () => void }

export default function LogTab({ userEmail, onSignOut, dark, onToggleDark }: Props) {
  const { days, setDays, addActivity, endActivity, updateActivity, groupActivities, deleteActivity } = useActivityStore()
  const [viewDate, setViewDate] = useState(todayKey())
  const [, setTick] = useState(0)
  const [toast, setToast] = useState<{msg:string, undoFn?:()=>void}|null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const [showLogSheet, setShowLogSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [logForm, setLogForm] = useState(initForm())
  const [editForm, setEditForm] = useState(initForm())
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const longPressRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const [menuId, setMenuId] = useState<string|null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [inlineNoteId, setInlineNoteId] = useState<string|null>(null)
  const [inlineNoteText, setInlineNoteText] = useState('')
  const swipeRef = useRef<{id:string,startX:number,currentX:number}|null>(null)
  const [swipeOffset, setSwipeOffset] = useState<Record<string,number>>({})
  const [menuPos, setMenuPos] = useState<{top:number,right:number}|null>(null)
  const [dragIdx, setDragIdx] = useState<number|null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null)
  const [showCal, setShowCal] = useState(false)
  const [calMonth, setCalMonth] = useState({y:new Date().getFullYear(),m:new Date().getMonth()})
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerDocked, setTimerDocked] = useState(true)
  const [timerFreePos, setTimerFreePos] = useState({x:0,y:0})
  const timerDragRef = useRef<{ox:number,oy:number,bx:number,by:number}|null>(null)
  const [floatingIds, setFloatingIds] = useState<Set<string>>(new Set())
  const winRefs = useRef<Record<string, Window | null>>({})
  const chanRefs = useRef<Record<string, BroadcastChannel>>({})
  const closedCheckers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  // persist activities
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY); if(s) setDays(JSON.parse(s)) } catch(e){} }, [])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(days)) } catch(e){} }, [days])
  useEffect(() => {
    const all = Object.values(days).flat()
    setFloatingIds(prev => {
      if (prev.size === 0) return prev
      const next = new Set(prev)
      prev.forEach(id => {
        const a = all.find(act => act.id === id)
        if (!a || a.endMs !== null) {
          const win = winRefs.current[id]
          if (win && !win.closed) { chanRefs.current[id]?.postMessage({type: 'close'}); win.close() }
          if (closedCheckers.current[id]) { clearInterval(closedCheckers.current[id]); delete closedCheckers.current[id] }
          chanRefs.current[id]?.close(); delete chanRefs.current[id]; delete winRefs.current[id]
          next.delete(id)
        }
      })
      return next.size !== prev.size ? next : prev
    })
  }, [days])

  useEffect(() => { const t = setInterval(() => setTick(n=>n+1), 1000); return () => clearInterval(t) }, [])

  const showToast = useCallback((msg:string, undoFn?:()=>void) => {
    setToast({msg,undoFn})
    if(toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), undoFn ? 4000 : 2000)
  }, [])

  const dayActs = days[viewDate] || []
  const running = dayActs.filter(a => a.endMs === null)
  const isToday = viewDate === todayKey()
  const dateObj = keyToDate(viewDate)

  const shiftDay = (n:number) => { const d=keyToDate(viewDate); d.setDate(d.getDate()+n); setViewDate(dkey(d)) }

  const computeItems = (acts: LocalActivity[]) => {
    const sorted = [...acts].sort((a,b) => b.activityNumber - a.activityNumber)
    const seen = new Set<string>()
    const items: Array<{type:'solo'|'group', acts:LocalActivity[], num:number}> = []
    sorted.forEach(a => {
      if(!a.groupId) { items.push({type:'solo',acts:[a],num:a.activityNumber}) }
      else if(!seen.has(a.groupId)) {
        seen.add(a.groupId)
        const grp = acts.filter(x=>x.groupId===a.groupId).sort((x,y)=>y.subIndex!-x.subIndex!)
        items.push({type:'group',acts:grp,num:a.activityNumber})
      }
    })
    return items
  }

  const instantLog = (activityType: 'Main' | 'Parallel') => {
    const existing = days[viewDate] || []
    const usedNums = new Set(existing.map(a => a.activityNumber))
    addActivity(viewDate, {
      id: uid(), startMs: Date.now(), endMs: null,
      category: 'No Status', subcategory: 'No Status', activityDoneAt: 'No Status',
      activityType, hasStartTimestamp: true,
      hasNotes: false, notes: '',
      loggedFrom: 'Daily Activity Log Web App (PWA)',
      loggedVia: 'Daily Activity Log Web App (PWA)',
      groupId: null, activityNumber: usedNums.size + 1, subIndex: null, notesStatus: 'undecided',
    })
    showToast(`${activityType} activity started`)
  }

  const handleLogSubmit = () => {
    const f = logForm
    const existing = days[viewDate] || []
    const usedNums = new Set(existing.map(a=>a.activityNumber))
    addActivity(viewDate, {
      id:uid(), startMs:f.hasStartTimestamp?Date.now():0, endMs:null,
      category:f.category, subcategory:f.subcategory, activityDoneAt:f.activityDoneAt,
      activityType:f.activityType, hasStartTimestamp:f.hasStartTimestamp,
      hasNotes:f.hasNotes, notes:f.hasNotes?f.notes:'',
      loggedFrom:f.loggedFrom, loggedVia:f.loggedVia,
      groupId:null, activityNumber:usedNums.size+1, subIndex:null,
    })
    setShowLogSheet(false); setLogForm(initForm()); showToast('Activity logged')
  }

  const logSameAsLast = () => {
    const existing = days[viewDate] || []
    if(!existing.length) { showToast('No previous activity'); return }
    const last = [...existing].sort((a,b)=>b.startMs-a.startMs)[0]
    const usedNums = new Set(existing.map(a=>a.activityNumber))
    addActivity(viewDate, {
      id:uid(), startMs:Date.now(), endMs:null,
      category:last.category, subcategory:last.subcategory, activityDoneAt:last.activityDoneAt,
      activityType:last.activityType, hasStartTimestamp:true,
      hasNotes:false, notes:'', loggedFrom:last.loggedFrom, loggedVia:last.loggedVia,
      groupId:null, activityNumber:usedNums.size+1, subIndex:null,
    })
    showToast(`Repeated: ${last.category}`)
  }

  const endDirectly = (a:LocalActivity) => {
    endActivity(viewDate, a.id, {category:a.category,subcategory:a.subcategory,activityDoneAt:a.activityDoneAt,activityType:a.activityType,hasNotes:a.hasNotes,notes:a.notes,loggedFrom:a.loggedFrom,loggedVia:a.loggedVia})
    showToast('Activity ended')
  }

  const openEdit = (a:LocalActivity) => {
    setEditingId(a.id)
    setEditForm({category:a.category,subcategory:a.subcategory,activityDoneAt:a.activityDoneAt,activityType:a.activityType,hasStartTimestamp:a.hasStartTimestamp,hasNotes:a.hasNotes,notes:a.notes,loggedFrom:a.loggedFrom,loggedVia:a.loggedVia})
    setMenuId(null); setMenuPos(null); setShowEditSheet(true)
  }

  const handleEditSubmit = () => {
    if(!editingId) return
    updateActivity(viewDate, editingId, {category:editForm.category,subcategory:editForm.subcategory,activityDoneAt:editForm.activityDoneAt,activityType:editForm.activityType,hasNotes:editForm.hasNotes,notes:editForm.hasNotes?editForm.notes:'',loggedFrom:editForm.loggedFrom,loggedVia:editForm.loggedVia})
    showToast('Saved'); setShowEditSheet(false); setEditingId(null)
  }

  const saveInlineNote = (id:string) => {
    if(inlineNoteText.trim()) {
      updateActivity(viewDate, id, {hasNotes:true, notes:inlineNoteText.trim(), notesStatus:'has-notes'})
      showToast('Note saved')
    } else {
      updateActivity(viewDate, id, {hasNotes:false, notes:'', notesStatus:'none'})
    }
    setInlineNoteId(null); setInlineNoteText('')
  }

  const handleDelete = (id:string) => {
    const act = dayActs.find(a=>a.id===id)
    if(!act) return
    deleteActivity(viewDate, id); setMenuId(null)
    showToast('Deleted', () => { addActivity(viewDate, act); showToast('Restored') })
  }

  const reorderItems = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    const copy = [...items]
    const [moved] = copy.splice(fromIdx, 1)
    copy.splice(toIdx, 0, moved)
    const n = copy.length
    copy.forEach((item, idx) => {
      const newNum = n - idx
      item.acts.forEach(a => { if(a.activityNumber !== newNum) updateActivity(viewDate, a.id, {activityNumber: newNum}) })
    })
    setDragIdx(null); setDragOverIdx(null)
  }

  const restoreTimer = (id: string) => {
    const win = winRefs.current[id]
    if (win && !win.closed) { chanRefs.current[id]?.postMessage({type: 'close'}); win.close() }
    if (closedCheckers.current[id]) { clearInterval(closedCheckers.current[id]); delete closedCheckers.current[id] }
    chanRefs.current[id]?.close()
    delete winRefs.current[id]; delete chanRefs.current[id]
    setFloatingIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const detachTimer = (a: LocalActivity) => {
    if (winRefs.current[a.id] && !winRefs.current[a.id]!.closed) { winRefs.current[a.id]!.focus(); return }
    const popup = window.open('', `dal-timer-${a.id}`, 'width=340,height=110,resizable=yes,scrollbars=no,toolbar=no,menubar=no,status=no,location=no')
    if (!popup) { showToast('Allow popups to use floating timers'); return }
    popup.document.write(buildPopupHtml(a.id, dark))
    popup.document.close()
    winRefs.current[a.id] = popup
    setFloatingIds(prev => new Set([...prev, a.id]))
    const ch = new BroadcastChannel(`dal-timer-${a.id}`)
    ch.addEventListener('message', e => { if (e.data.type === 'restore') restoreTimer(a.id) })
    chanRefs.current[a.id] = ch
    closedCheckers.current[a.id] = setInterval(() => {
      if (popup.closed) { clearInterval(closedCheckers.current[a.id]); delete closedCheckers.current[a.id]; restoreTimer(a.id) }
    }, 500)
  }

  const toggleSelect = (id:string) => setSelected(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const handleLongPressStart = (id:string) => { longPressRef.current = setTimeout(() => { setSelectMode(true); setSelected(new Set([id])) }, 500) }
  const handleLongPressEnd = () => { if(longPressRef.current) clearTimeout(longPressRef.current) }
  const handleGroup = () => {
    if(selected.size<2) { showToast('Select at least 2'); return }
    groupActivities(viewDate, Array.from(selected))
    setSelectMode(false); setSelected(new Set()); showToast('Grouped!')
  }

  const onSwipeStart = (e:React.TouchEvent, id:string) => { swipeRef.current={id,startX:e.touches[0].clientX,currentX:e.touches[0].clientX} }
  const onSwipeMove = (e:React.TouchEvent) => {
    if(!swipeRef.current) return
    const dx = e.touches[0].clientX - swipeRef.current.startX
    if(dx<0) { swipeRef.current.currentX=e.touches[0].clientX; setSwipeOffset(p=>({...p,[swipeRef.current!.id]:Math.max(dx,-120)})) }
  }
  const onSwipeEnd = () => {
    if(!swipeRef.current) return
    const dx = swipeRef.current.currentX - swipeRef.current.startX
    setSwipeOffset(p=>({...p,[swipeRef.current!.id]:dx<-80?-100:0}))
    swipeRef.current=null
  }
  const closeSwipe = (id:string) => setSwipeOffset(p=>({...p,[id]:0}))

  const quickChips = Object.keys(CATEGORIES).filter(c=>c!=='No Status').slice(0,6)
  const items = computeItems(dayActs)
  const menuAct = menuId ? (dayActs.find(a => a.id === menuId) ?? null) : null

  // ── theme tokens ─────────────────────────────────────────────────────────────
  const T = dark ? {
    bg:        'bg-[#0D1117]',
    surface:   'bg-[#151B23]',
    surfaceHov:'hover:bg-[#1B2330]',
    card:      'bg-[#151B23]',
    cardInner: 'bg-[#1B2330]',
    border:    'border-[#2A3340]',
    borderHov: 'hover:border-[#4A5568]',
    text:      'text-[#E6EDF3]',
    textSub:   'text-[#8B98A9]',
    textFaint: 'text-[#5C6878]',
    input:     'bg-[#1B2330] border-[#2A3340] text-[#E6EDF3] placeholder-[#5C6878]',
    select:    'bg-[#1B2330] border-[#2A3340] text-[#E6EDF3]',
    chip:      'bg-[#1B2330] border-[#2A3340] text-[#8B98A9] hover:border-[#4A5568] hover:text-[#E6EDF3]',
    mainChip:  'bg-blue-500/20 text-blue-300 border-blue-500/40',
    parChip:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    inactiveChip: 'bg-[#1B2330] text-[#5C6878] border-[#2A3340]',
    runBorder: 'border-amber-500/40',
    runBg:     'bg-amber-500/8',
    runGlow:   '0 0 24px rgba(245,181,68,0.12)',
    grpBorder: 'border-purple-500/30',
    grpBg:     'bg-purple-500/8',
    grpGlow:   '0 0 24px rgba(168,85,247,0.08)',
    divider:   'divide-[#1B2330]',
    shadow:    'shadow-lg shadow-black/20',
  } : {
    bg:        'bg-[#F4F6F9]',
    surface:   'bg-white',
    surfaceHov:'hover:bg-gray-50',
    card:      'bg-white',
    cardInner: 'bg-gray-50',
    border:    'border-gray-200',
    borderHov: 'hover:border-gray-400',
    text:      'text-gray-900',
    textSub:   'text-gray-500',
    textFaint: 'text-gray-400',
    input:     'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
    select:    'bg-white border-gray-200 text-gray-900',
    chip:      'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800',
    mainChip:  'bg-blue-50 text-blue-600 border-blue-200',
    parChip:   'bg-amber-50 text-amber-600 border-amber-200',
    inactiveChip: 'bg-gray-50 text-gray-400 border-gray-200',
    runBorder: 'border-amber-300',
    runBg:     'bg-amber-50',
    runGlow:   '0 4px 20px rgba(245,181,68,0.15)',
    grpBorder: 'border-purple-200',
    grpBg:     'bg-purple-50',
    grpGlow:   '0 4px 20px rgba(168,85,247,0.08)',
    divider:   'divide-gray-100',
    shadow:    'shadow-sm shadow-gray-200',
  }

  const selCls = `w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors ${T.select}`

  // ── sub-components ────────────────────────────────────────────────────────────
  const TypeChips = ({ a }: { a: LocalActivity }) => (
    <div className="flex gap-1 flex-shrink-0">
      <button onClick={e=>{e.stopPropagation();updateActivity(viewDate,a.id,{activityType:'Main'})}}
        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${a.activityType==='Main' ? T.mainChip : T.inactiveChip+' hover:border-blue-300 hover:text-blue-400'}`}>
        Main
      </button>
      <button onClick={e=>{e.stopPropagation();updateActivity(viewDate,a.id,{activityType:'Parallel'})}}
        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${a.activityType==='Parallel' ? T.parChip : T.inactiveChip+' hover:border-amber-300 hover:text-amber-400'}`}>
        Parallel
      </button>
    </div>
  )

  const InlineNote = ({ a }: { a: LocalActivity }) => {
    const status = a.notesStatus ?? (a.hasNotes && a.notes ? 'has-notes' : 'undecided')

    if (inlineNoteId === a.id) return (
      <div className="mt-2 space-y-2" onClick={e=>e.stopPropagation()}>
        <textarea autoFocus value={inlineNoteText} onChange={e=>setInlineNoteText(e.target.value)}
          placeholder="Type your note…" rows={2}
          className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-xs resize-none transition-colors ${T.input}`}/>
        <div className="flex gap-2">
          <button onClick={()=>{setInlineNoteId(null);setInlineNoteText('')}}
            className={`flex-1 py-2 text-xs font-bold ${T.textSub} ${T.cardInner} border ${T.border} rounded-lg hover:opacity-80 transition-opacity`}>Cancel</button>
          <button onClick={()=>saveInlineNote(a.id)}
            className="flex-1 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">Save</button>
        </div>
      </div>
    )

    if (status === 'undecided') return (
      <div className={`mt-2 text-xs ${T.cardInner} border ${T.border} rounded-lg px-3 py-2 flex items-center gap-2`} onClick={e=>e.stopPropagation()}>
        <span>🟡</span>
        <span className={T.textFaint}>Notes?</span>
        <div className="ml-auto flex gap-2">
          <button onClick={()=>{updateActivity(viewDate,a.id,{notesStatus:'has-notes'});setInlineNoteId(a.id);setInlineNoteText('')}}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">+ Add</button>
          <button onClick={()=>updateActivity(viewDate,a.id,{notesStatus:'none',hasNotes:false})}
            className={`text-[10px] font-bold ${T.textFaint} hover:text-red-400 transition-colors`}>None</button>
        </div>
      </div>
    )

    if (status === 'none') return (
      <div className={`mt-2 text-xs ${T.textFaint} ${T.cardInner} border ${T.border} rounded-lg px-3 py-2 flex items-center gap-2`} onClick={e=>e.stopPropagation()}>
        <span>🔴</span><span>No notes</span>
        <button onClick={()=>updateActivity(viewDate,a.id,{notesStatus:'undecided'})}
          className="ml-auto text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">Change</button>
      </div>
    )

    return (
      <div className={`mt-2 text-xs ${T.textSub} ${T.cardInner} border ${T.border} rounded-lg px-3 py-2 flex items-start gap-2`} onClick={e=>e.stopPropagation()}>
        <span className="flex-shrink-0 mt-0.5"><IcoNote /></span>
        <span className="flex-1 leading-relaxed">{a.notes || '…'}</span>
        <button onClick={()=>{setInlineNoteId(a.id);setInlineNoteText(a.notes||'')}}
          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex-shrink-0 transition-colors">Edit</button>
      </div>
    )
  }

  const FormFields = ({ form, setForm }: { form: ReturnType<typeof initForm>, setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof initForm>>> }) => (
    <>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Category</label>
        <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value,subcategory:'No Status'}))} className={selCls}>
          {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Subcategory</label>
        <select value={form.subcategory} onChange={e=>setForm(f=>({...f,subcategory:e.target.value}))} className={selCls}>
          {(CATEGORIES[form.category]||['No Status']).map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Activity Done At</label>
        <select value={form.activityDoneAt} onChange={e=>setForm(f=>({...f,activityDoneAt:e.target.value}))} className={selCls}>
          {ACTIVITY_DONE_AT.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Activity Type</label>
        <div className="flex gap-2">
          {(['Main','Parallel'] as const).map(t=>(
            <button key={t} onClick={()=>setForm(f=>({...f,activityType:t}))}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors border ${
                form.activityType===t
                  ? t==='Main' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-amber-500 border-amber-500 text-white'
                  : `${T.cardInner} ${T.border} ${T.textFaint} hover:opacity-80`
              }`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between py-1">
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase ${T.textFaint}`}>Has Start Timestamp</label>
        <button onClick={()=>setForm(f=>({...f,hasStartTimestamp:!f.hasStartTimestamp}))}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.hasStartTimestamp ? 'bg-blue-600' : dark ? 'bg-[#2A3340]' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${form.hasStartTimestamp ? 'left-5' : 'left-0.5'}`}/>
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <label className={`text-[10px] font-bold tracking-[1.5px] uppercase ${T.textFaint}`}>Has Notes</label>
          <button onClick={()=>setForm(f=>({...f,hasNotes:!f.hasNotes}))}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.hasNotes ? 'bg-blue-600' : dark ? 'bg-[#2A3340]' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${form.hasNotes ? 'left-5' : 'left-0.5'}`}/>
          </button>
        </div>
        {form.hasNotes && (
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Enter notes…" rows={3}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none text-sm transition-colors ${T.input}`}/>
        )}
      </div>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Logged From</label>
        <select value={form.loggedFrom} onChange={e=>setForm(f=>({...f,loggedFrom:e.target.value}))} className={selCls}>
          {ACTIVITY_LOGGED_FROM.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className={`text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5 ${T.textFaint}`}>Logged Via</label>
        <select value={form.loggedVia} onChange={e=>setForm(f=>({...f,loggedVia:e.target.value}))} className={selCls}>
          {ACTIVITY_LOGGED_VIA.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </>
  )

  return (
    <div className={`min-h-screen ${T.bg} ${T.text} transition-colors duration-200`}>

      {/* ── HEADER ── */}
      <header className={`md:hidden ${T.surface} border-b ${T.border} px-4 py-3 flex items-center gap-3 sticky top-0 z-20 ${T.shadow}`}>
        <div className={`w-8 h-8 rounded-xl ${dark ? 'bg-green-400/10 border border-green-400/20' : 'bg-green-50 border border-green-200'} flex items-center justify-center flex-shrink-0`}>
          <span className="text-green-500"><IcoClock /></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-bold ${T.textFaint}`}>Daily Activity Log</div>
          <div className={`text-[10px] ${T.textFaint} truncate hidden sm:block`}>{userEmail}</div>
        </div>
        {running.length > 0 && (
          <button onClick={()=>setTimerOpen(o=>!o)}
            className={`relative w-8 h-8 rounded-lg border ${dark?'border-amber-500/30 bg-amber-500/10':'border-amber-300 bg-amber-50'} flex items-center justify-center ${dark?'text-amber-400':'text-amber-600'}`}>
            <IcoClock/>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">{running.length}</span>
          </button>
        )}
        <button onClick={onToggleDark}
          className={`w-8 h-8 rounded-lg border ${T.border} ${T.cardInner} flex items-center justify-center ${T.textSub} hover:opacity-80 transition-opacity`}>
          {dark ? <IcoSun /> : <IcoMoon />}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4 pb-24 md:pb-8">

        {/* ── DATE BAR ── */}
        <div className="relative">
          <div className={`${T.surface} border ${T.border} rounded-2xl p-3 flex items-center gap-2 ${T.shadow}`}>
            <button onClick={()=>shiftDay(-1)} className={`w-9 h-9 rounded-xl border ${T.border} ${T.cardInner} flex items-center justify-center flex-shrink-0 ${T.textSub} hover:opacity-80 transition-opacity`}>
              <IcoChevL />
            </button>
            <button className="flex-1 text-center hover:opacity-80 transition-opacity" onClick={()=>{const d=keyToDate(viewDate);setCalMonth({y:d.getFullYear(),m:d.getMonth()});setShowCal(c=>!c)}}>
              <div className={`text-[10px] font-bold tracking-[2px] uppercase ${T.textFaint}`}>{DOW[dateObj.getDay()]}</div>
              <div className="text-base font-bold mt-0.5">
                {isToday && <span style={{color:'#f7ef00'}}>Today · </span>}
                {dateObj.getDate()} {MON[dateObj.getMonth()]} {dateObj.getFullYear()}
              </div>
            </button>
            <button onClick={()=>shiftDay(1)} className={`w-9 h-9 rounded-xl border ${T.border} ${T.cardInner} flex items-center justify-center flex-shrink-0 ${T.textSub} hover:opacity-80 transition-opacity`}>
              <IcoChevR />
            </button>
            {!isToday && (
              <button onClick={()=>setViewDate(todayKey())}
                className="text-xs font-bold text-blue-500 border border-blue-500/30 bg-blue-500/10 rounded-xl px-3 h-9 flex-shrink-0 hover:bg-blue-500/20 transition-colors">
                Today
              </button>
            )}
          </div>

          {/* ── CALENDAR POPUP ── */}
          {showCal && (
            <div className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] w-[320px] z-50 ${T.surface} border ${T.border} rounded-2xl p-3 shadow-xl`}
              onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={()=>setCalMonth(m=>{const d=new Date(m.y,m.m-1,1);return{y:d.getFullYear(),m:d.getMonth()}})}
                  className={`w-7 h-7 rounded-lg ${T.cardInner} border ${T.border} flex items-center justify-center ${T.textSub} hover:opacity-80 flex-shrink-0`}><IcoChevL/></button>
                <div className="flex-1 flex items-center justify-center gap-1">
                  <select
                    value={calMonth.m}
                    onChange={e=>setCalMonth(m=>({...m,m:Number(e.target.value)}))}
                    className={`text-xs font-bold border rounded-lg px-1.5 py-1 focus:outline-none focus:border-blue-500 transition-colors ${T.select}`}>
                    {MON.map((name,i)=><option key={i} value={i}>{name}</option>)}
                  </select>
                  <select
                    value={calMonth.y}
                    onChange={e=>setCalMonth(m=>({...m,y:Number(e.target.value)}))}
                    className={`text-xs font-bold border rounded-lg px-1.5 py-1 focus:outline-none focus:border-blue-500 transition-colors ${T.select}`}>
                    {Array.from({length:11},(_,i)=>new Date().getFullYear()-5+i).map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={()=>setCalMonth(m=>{const d=new Date(m.y,m.m+1,1);return{y:d.getFullYear(),m:d.getMonth()}})}
                  className={`w-7 h-7 rounded-lg ${T.cardInner} border ${T.border} flex items-center justify-center ${T.textSub} hover:opacity-80 flex-shrink-0`}><IcoChevR/></button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {['S','M','T','W','T','F','S'].map((d,i)=>(
                  <div key={i} className={`text-center text-[10px] font-bold ${T.textFaint} py-1`}>{d}</div>
                ))}
              </div>
              {(() => {
                const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay()
                const daysInMonth = new Date(calMonth.y, calMonth.m+1, 0).getDate()
                const todayObj = new Date()
                const cells: React.ReactNode[] = []
                for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`}/>)
                for(let d=1;d<=daysInMonth;d++) {
                  const dayDate = new Date(calMonth.y, calMonth.m, d)
                  const k = dkey(dayDate)
                  const isTd = todayObj.getFullYear()===calMonth.y && todayObj.getMonth()===calMonth.m && todayObj.getDate()===d
                  const isSel = viewDate===k
                  const hasActs = !!(days[k]?.length)
                  cells.push(
                    <button key={d} onClick={()=>{setViewDate(k);setShowCal(false)}}
                      className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-xs font-semibold transition-all border ${
                        isSel ? 'bg-blue-600 text-white border-blue-600' :
                        isTd ? (dark
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/35 hover:border-blue-500/50'
                          : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300') :
                        (dark
                          ? `${T.textSub} border-transparent hover:${T.cardInner} hover:border-[#2A3340] hover:text-[#E6EDF3]`
                          : `${T.textSub} border-transparent hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900`)
                      }`}>
                      {d}
                      {hasActs && !isSel && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isTd?(dark?'bg-blue-400':'bg-blue-500'):(dark?'bg-[#4A5568]':'bg-gray-300')}`}/>}
                    </button>
                  )
                }
                return <div className="grid grid-cols-7 gap-0.5">{cells}</div>
              })()}
            </div>
          )}
        </div>

        {/* ── RUNNING BANNERS ── */}
        {running.map(a => (
          <div key={a.id} className={`${T.runBg} border ${T.runBorder} rounded-2xl px-4 py-3 flex items-center gap-3`}
            style={{boxShadow: T.runGlow}}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold tracking-[1.5px] uppercase ${dark?'text-amber-400':'text-amber-600'}`}>Running</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${a.activityType==='Main' ? T.mainChip : T.parChip}`}>{a.activityType}</span>
              </div>
              <div className={`text-sm ${T.textSub} truncate font-medium`}>{a.category}{a.subcategory!=='No Status'?' › '+a.subcategory:''}</div>
            </div>
            <div className={`font-mono text-lg font-bold tabular-nums ${dark?'text-amber-400':'text-amber-600'}`}>
              {floatingIds.has(a.id)
                ? <span className={`text-[10px] font-semibold ${dark?'text-[#5C6878]':'text-gray-400'}`}>floating ↗</span>
                : fmtClock(Date.now()-a.startMs)}
            </div>
            <button
              onClick={() => floatingIds.has(a.id) ? restoreTimer(a.id) : detachTimer(a)}
              title={floatingIds.has(a.id) ? 'Restore timer' : 'Open as floating window'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border ${
                floatingIds.has(a.id)
                  ? (dark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-500 border-blue-200')
                  : (dark ? 'bg-[#1B2330] border-[#2A3340] text-[#5C6878] hover:text-blue-400 hover:border-blue-400/50' : 'bg-white border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200')
              }`}>
              <IcoDetach/>
            </button>
          </div>
        ))}

        {/* ── STATS CARDS ── */}
        <div className="pt-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: 'Logged Activities',
                value: dayActs.length,
                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
                numCls:   dark ? 'text-blue-400'   : 'text-blue-600',
                lblCls:   dark ? 'text-blue-400/70' : 'text-blue-500',
                cardCls:  dark ? 'bg-blue-500/15 border-blue-500/30' : 'bg-blue-50 border-blue-200',
                badgeCls: 'bg-blue-500',
                glow:     'rgba(59,130,246,0.45)',
              },
              {
                label: 'Running Activities',
                value: running.length,
                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                numCls:   running.length > 0 ? (dark ? 'text-amber-400'   : 'text-amber-600') : T.textFaint,
                lblCls:   running.length > 0 ? (dark ? 'text-amber-400/70' : 'text-amber-500') : T.textFaint,
                cardCls:  running.length > 0 ? (dark ? 'bg-amber-500/15 border-amber-500/30' : 'bg-amber-50 border-amber-200') : `${T.surface} ${T.border}`,
                badgeCls: running.length > 0 ? 'bg-amber-500' : (dark ? 'bg-[#1B2330]' : 'bg-gray-300'),
                glow:     running.length > 0 ? 'rgba(245,158,11,0.45)' : 'transparent',
              },
              {
                label: 'Completed Activities',
                value: dayActs.filter(a => a.endMs !== null).length,
                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                numCls:   dark ? 'text-green-400'   : 'text-green-600',
                lblCls:   dark ? 'text-green-400/70' : 'text-green-600',
                cardCls:  dark ? 'bg-green-500/15 border-green-500/30' : 'bg-green-50 border-green-200',
                badgeCls: 'bg-green-500',
                glow:     'rgba(34,197,94,0.45)',
              },
              {
                label: 'Activity Groups',
                value: new Set(dayActs.filter(a => a.groupId).map(a => a.groupId)).size,
                icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
                numCls:   dark ? 'text-purple-400'   : 'text-purple-600',
                lblCls:   dark ? 'text-purple-400/70' : 'text-purple-600',
                cardCls:  dark ? 'bg-purple-500/15 border-purple-500/30' : 'bg-purple-50 border-purple-200',
                badgeCls: 'bg-purple-500',
                glow:     'rgba(168,85,247,0.45)',
              },
            ].map(s => (
              <div key={s.label} className={`relative border rounded-2xl px-1.5 pt-9 pb-3 flex flex-col items-center gap-1.5 ${T.shadow} ${s.cardCls}`}>
                {/* Floating icon badge — half outside card top */}
                <div
                  className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white ${s.badgeCls}`}
                  style={{boxShadow:`0 0 0 3px ${dark?'#0D1117':'#F4F6F9'}, 0 4px 14px ${s.glow}`}}
                >
                  {s.icon}
                </div>
                <div className={`font-mono text-2xl font-bold leading-none tabular-nums ${s.numCls}`}>{s.value}</div>
                <div className={`text-[8.5px] font-bold tracking-[0.8px] uppercase leading-tight text-center ${s.lblCls}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INSTANT LOG BUTTONS ── */}
        <div className="flex gap-3">
          <button onClick={() => instantLog('Main')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/25">
            <IcoPlus /><span>Main Activity</span>
          </button>
          <button onClick={() => instantLog('Parallel')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl text-sm transition-all active:scale-[0.98] border ${dark ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 shadow-sm'}`}>
            <IcoPlus /><span>Parallel Activity</span>
          </button>
        </div>

        {/* ── QUICK LOG ── */}
        <div className={`${T.surface} border ${T.border} rounded-2xl p-3 ${T.shadow}`}>
          <div className={`text-[10px] font-bold tracking-[1.5px] uppercase mb-2.5 ${T.textFaint}`}>Quick Log</div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            {quickChips.map(cat=>(
              <button key={cat} onClick={()=>{
                const existing=days[viewDate]||[]
                const usedNums=new Set(existing.map(a=>a.activityNumber))
                addActivity(viewDate,{id:uid(),startMs:Date.now(),endMs:null,category:cat,subcategory:'No Status',activityDoneAt:'No Status',activityType:'Main',hasStartTimestamp:true,hasNotes:false,notes:'',loggedFrom:'Daily Activity Log Web App (PWA)',loggedVia:'Daily Activity Log Web App (PWA)',groupId:null,activityNumber:usedNums.size+1,subIndex:null})
                showToast(`Logged: ${cat}`)
              }}
                className={`flex-none text-xs font-semibold border rounded-xl px-3.5 py-2 transition-all whitespace-nowrap active:scale-95 ${T.chip}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── SELECT BAR ── */}
        {selectMode && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-3">
            <span className="text-blue-500 text-sm font-bold flex-1">{selected.size} selected</span>
            <button onClick={handleGroup} disabled={selected.size<2}
              className={`text-sm font-bold px-4 py-1.5 rounded-xl transition-colors ${selected.size>=2?'bg-purple-600 hover:bg-purple-700 text-white':`${T.cardInner} ${T.textFaint}`}`}>
              Group
            </button>
            <button onClick={()=>{setSelectMode(false);setSelected(new Set())}}
              className={`text-sm font-bold px-4 py-1.5 rounded-xl ${T.cardInner} border ${T.border} ${T.textSub} hover:opacity-80`}>
              Cancel
            </button>
          </div>
        )}

        {/* ── LIST HEADER ── */}
        <div className="flex items-center gap-2 px-0.5">
          <h2 className={`text-[10px] font-bold tracking-[1.5px] uppercase ${T.textFaint}`}>
            {isToday ? "Today's Activities" : "Activities"}
          </h2>
          {dayActs.length>0 && <span className={`font-mono text-[10px] ${T.textFaint}`}>{dayActs.length} logged</span>}
        </div>

        {/* ── EMPTY STATE ── */}
        {dayActs.length===0 && (
          <div className={`${T.surface} border ${T.border} rounded-2xl p-12 text-center ${T.shadow}`}>
            <div className={`w-16 h-16 rounded-2xl ${dark?'bg-[#1B2330]':'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
              <span className={T.textFaint}><IcoClock /></span>
            </div>
            <div className={`font-bold text-base ${T.textSub}`}>No activities yet</div>
            <div className={`text-sm mt-1 ${T.textFaint}`}>Use Quick Log above or tap <span className="text-blue-500 font-semibold">+ Log Activity</span></div>
          </div>
        )}

        {/* ── ACTIVITY LIST ── */}
        <div className="space-y-2.5">
          {items.map((item, itemIdx) => {
            if(item.type==='solo') {
              const a = item.acts[0]
              const isRunning = a.endMs===null
              const elapsed = isRunning ? Date.now()-a.startMs : a.endMs!-a.startMs
              const isMain = a.activityType==='Main'
              const isSelected = selected.has(a.id)
              const swipeX = swipeOffset[a.id]||0

              return (
                <div key={a.id}
                  draggable={!selectMode}
                  onDragStart={()=>setDragIdx(itemIdx)}
                  onDragOver={e=>{e.preventDefault();setDragOverIdx(itemIdx)}}
                  onDragEnd={()=>{if(dragIdx!==null&&dragOverIdx!==null)reorderItems(dragIdx,dragOverIdx);setDragIdx(null);setDragOverIdx(null)}}
                  className={`relative overflow-hidden rounded-2xl transition-opacity ${dragIdx===itemIdx?'opacity-40':''} ${dragOverIdx===itemIdx&&dragIdx!==itemIdx?'ring-2 ring-blue-500/50':''}`}>
                  {/* swipe actions */}
                  <div className="absolute right-0 top-0 bottom-0 flex items-stretch rounded-r-2xl overflow-hidden">
                    <button onClick={()=>{endDirectly(a);closeSwipe(a.id)}}
                      className={`w-16 flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${dark?'bg-red-500/20 text-red-400':'bg-red-50 text-red-500'} border-l ${dark?'border-red-500/30':'border-red-200'}`}>
                      <IcoStop/><span>End</span>
                    </button>
                    <button onClick={()=>{handleDelete(a.id);closeSwipe(a.id)}}
                      className="w-16 bg-red-600 flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold">
                      <IcoTrash/><span>Delete</span>
                    </button>
                  </div>

                  {/* card */}
                  <div
                    onMouseDown={()=>handleLongPressStart(a.id)}
                    onMouseUp={handleLongPressEnd}
                    onTouchStart={e=>{handleLongPressStart(a.id);onSwipeStart(e,a.id)}}
                    onTouchMove={onSwipeMove}
                    onTouchEnd={()=>{handleLongPressEnd();onSwipeEnd()}}
                    style={{
                      transform:`translateX(${swipeX}px)`,
                      transition:swipeRef.current?.id===a.id?'none':'transform 0.2s ease',
                      boxShadow:isRunning?T.runGlow:(dark?'0 2px 12px rgba(0,0,0,0.2)':'0 2px 8px rgba(0,0,0,0.06)'),
                    }}
                    className={`${T.card} border rounded-2xl p-4 transition-colors ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' :
                      isRunning ? T.runBorder :
                      isMain ? `border-l-[3px] border-l-blue-500 ${T.border.replace('border-','border-t-').replace('[','[').replace(']',']')} ${T.border}` :
                      `border-l-[3px] border-l-amber-500 ${T.border}`
                    }`}
                  >
                    {/* row 1: drag handle + number + type chips + timer + menu */}
                    <div className="flex items-center gap-2">
                      {selectMode ? (
                        <button onClick={()=>toggleSelect(a.id)}
                          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected?'bg-blue-600 border-blue-600':'border-gray-400'}`}>
                          {isSelected && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                      ) : (
                        <div className={`cursor-grab active:cursor-grabbing flex-shrink-0 opacity-25 hover:opacity-60 transition-opacity`}>
                          <IcoDrag/>
                        </div>
                      )}
                      <span className={`font-mono text-xs font-bold ${T.textFaint} ${T.cardInner} border ${T.border} rounded-lg px-2 py-0.5 flex-shrink-0`}>#{a.activityNumber}</span>
                      <TypeChips a={a} />
                      {a.activityDoneAt!=='No Status' && (
                        <span className={`text-[10px] ${T.cardInner} border ${T.border} px-2 py-0.5 rounded-lg ${T.textFaint} hidden sm:inline`}>{a.activityDoneAt}</span>
                      )}
                      <span className={`font-mono text-sm font-bold ml-auto flex-shrink-0 tabular-nums ${isRunning ? isMain?'text-blue-500':'text-amber-500' : 'text-green-500'}`}>
                        {isRunning && floatingIds.has(a.id)
                          ? <span className={`text-[9px] font-semibold ${dark?'text-[#5C6878]':'text-gray-400'}`}>floating ↗</span>
                          : (isRunning ? fmtClock(elapsed) : fmtDur(elapsed))}
                      </span>
                      {isRunning && !selectMode && (
                        <button
                          onClick={e=>{e.stopPropagation(); floatingIds.has(a.id) ? restoreTimer(a.id) : detachTimer(a)}}
                          title={floatingIds.has(a.id) ? 'Restore timer to card' : 'Open as floating window'}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            floatingIds.has(a.id)
                              ? (dark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-500 border border-blue-200')
                              : `${T.cardInner} border ${T.border} ${T.textFaint} hover:text-blue-400 hover:border-blue-400/50`
                          }`}>
                          <IcoDetach/>
                        </button>
                      )}
                      {!selectMode && (
                        <div className="relative flex-shrink-0">
                          <button onClick={e=>{e.stopPropagation();if(menuId===a.id){setMenuId(null);setMenuPos(null)}else{const r=(e.currentTarget as HTMLElement).getBoundingClientRect();setMenuPos({top:r.bottom+4,right:window.innerWidth-r.right});setMenuId(a.id)}}}
                            className={`w-7 h-7 rounded-lg ${T.cardInner} border ${T.border} flex items-center justify-center ${T.textSub} hover:opacity-80 transition-opacity`}>
                            <IcoDots/>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* row 2: category */}
                    <div className="mt-3">
                      <span className={`font-bold text-base ${T.text}`}>{a.category}</span>
                      {a.subcategory!=='No Status' && <span className={`text-sm ${T.textSub} ml-1`}>› {a.subcategory}</span>}
                    </div>

                    {/* row 3: timestamps */}
                    <div className="mt-2 space-y-1">
                      {a.hasStartTimestamp && a.startMs>0 && (
                        <div className={`flex items-center gap-2 text-xs ${T.textFaint}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"/>
                          <span className="font-mono">{fmtTS(a.startMs)}</span>
                        </div>
                      )}
                      {isRunning ? (
                        <div className={`flex items-center gap-2 text-xs ${dark?'text-amber-500/60':'text-amber-400'}`}>
                          <span className="w-1.5 h-1.5 rounded-full border border-amber-500 flex-shrink-0"/>
                          <span>still running…</span>
                        </div>
                      ) : a.endMs ? (
                        <div className={`flex items-center gap-2 text-xs ${T.textFaint}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>
                          <span className="font-mono">{fmtTS(a.endMs)}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* inline note */}
                    <InlineNote a={a}/>

                    {/* end button */}
                    {isRunning && !selectMode && (
                      <button onClick={()=>endDirectly(a)}
                        className={`mt-3 w-full py-2.5 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${dark?'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25':'bg-red-50 hover:bg-red-100 text-red-500 border-red-200'}`}>
                        <IcoStop/><span>End Activity</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            // ── GROUP ──
            const grp = item.acts
            const groupRunning = grp.some(a=>a.endMs===null)
            const groupStartMs = Math.min(...grp.map(a=>a.startMs))
            const groupEndMs = groupRunning ? null : Math.max(...grp.map(a=>a.endMs!))
            const groupTotal = groupRunning ? Date.now()-groupStartMs : groupEndMs!-groupStartMs
            const isCollapsed = collapsed.has(grp[0].groupId!)
            const toggleCollapse = () => setCollapsed(prev=>{const n=new Set(prev);n.has(grp[0].groupId!)?n.delete(grp[0].groupId!):n.add(grp[0].groupId!);return n})

            return (
              <div key={grp[0].groupId}
                draggable={!selectMode}
                onDragStart={()=>setDragIdx(itemIdx)}
                onDragOver={e=>{e.preventDefault();setDragOverIdx(itemIdx)}}
                onDragEnd={()=>{if(dragIdx!==null&&dragOverIdx!==null)reorderItems(dragIdx,dragOverIdx);setDragIdx(null);setDragOverIdx(null)}}
                className={`${T.card} border rounded-2xl overflow-hidden transition-opacity ${dragIdx===itemIdx?'opacity-40':''} ${dragOverIdx===itemIdx&&dragIdx!==itemIdx?'ring-2 ring-blue-500/50':''}`}
                style={{boxShadow:groupRunning?T.runGlow:T.grpGlow, borderColor: groupRunning?(dark?'rgba(245,181,68,0.4)':'rgb(252,211,77)'):(dark?'rgba(168,85,247,0.3)':'rgb(221,214,254)')}}>

                {/* group header */}
                <button onClick={toggleCollapse}
                  className={`w-full ${groupRunning?(dark?'bg-amber-500/8':'bg-amber-50'):(dark?'bg-purple-500/8':'bg-purple-50')} border-b px-4 py-3 flex items-center gap-2.5`}
                  style={{borderColor:groupRunning?(dark?'rgba(245,181,68,0.2)':'rgb(253,230,138)'):(dark?'rgba(168,85,247,0.2)':'rgb(221,214,254)')}}>
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${dark?'bg-purple-500/15 text-purple-400 border-purple-500/25':'bg-purple-100 text-purple-600 border-purple-200'} tracking-wider`}>
                    #{item.num} GROUP
                  </div>
                  <span className={`text-[10px] ${T.textFaint}`}>{grp.length} activities</span>
                  <span className={`font-mono text-sm font-bold ml-auto tabular-nums ${groupRunning?(dark?'text-amber-400':'text-amber-600'):'text-green-500'}`}>
                    {groupRunning?fmtClock(groupTotal):fmtDur(groupTotal)}
                  </span>
                  <span className={T.textFaint}>{isCollapsed?<IcoChevD/>:<IcoChevU/>}</span>
                </button>

                {!isCollapsed && (
                  <div className={`divide-y ${T.divider}`}>
                    {grp.map(a=>{
                      const isRunning=a.endMs===null
                      const elapsed=isRunning?Date.now()-a.startMs:a.endMs!-a.startMs
                      const isMain=a.activityType==='Main'
                      const isSelected=selected.has(a.id)
                      return (
                        <div key={a.id}
                          onMouseDown={()=>handleLongPressStart(a.id)}
                          onMouseUp={handleLongPressEnd}
                          onTouchStart={()=>handleLongPressStart(a.id)}
                          onTouchEnd={handleLongPressEnd}
                          className={`px-4 py-3 border-l-[3px] ${isMain?'border-l-blue-500':'border-l-amber-500'} ${isSelected?(dark?'bg-blue-500/8':'bg-blue-50'):''} transition-colors`}>
                          <div className="flex items-center gap-2">
                            {selectMode && (
                              <button onClick={()=>toggleSelect(a.id)}
                                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${isSelected?'bg-blue-600 border-blue-600':'border-gray-400'}`}>
                                {isSelected&&<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                              </button>
                            )}
                            <span className={`font-mono text-[10px] font-bold ${T.textFaint}`}>#{item.num}.{a.subIndex}</span>
                            <TypeChips a={a}/>
                            <span className={`font-mono text-xs font-bold ml-auto tabular-nums ${isRunning?isMain?'text-blue-500':'text-amber-500':'text-green-500'}`}>
                              {isRunning?fmtClock(elapsed):fmtDur(elapsed)}
                            </span>
                            {!selectMode && (
                              <div className="relative">
                                <button onClick={e=>{e.stopPropagation();if(menuId===a.id){setMenuId(null);setMenuPos(null)}else{const r=(e.currentTarget as HTMLElement).getBoundingClientRect();setMenuPos({top:r.bottom+4,right:window.innerWidth-r.right});setMenuId(a.id)}}}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${T.textFaint} hover:opacity-80`}><IcoDots/></button>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={`font-bold text-sm ${T.text}`}>{a.category}</span>
                            {a.subcategory!=='No Status' && <span className={`text-sm ${T.textSub} ml-1`}>› {a.subcategory}</span>}
                          </div>
                          <div className="mt-1.5 space-y-1">
                            {a.hasStartTimestamp && a.startMs>0 && (
                              <div className={`flex items-center gap-1.5 text-xs ${T.textFaint}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"/>
                                <span className="font-mono">{fmtTS(a.startMs)}</span>
                              </div>
                            )}
                            {isRunning ? (
                              <div className={`flex items-center gap-1.5 text-xs ${dark?'text-amber-500/60':'text-amber-400'}`}>
                                <span className="w-1.5 h-1.5 rounded-full border border-amber-500 flex-shrink-0"/>
                                <span>still running…</span>
                              </div>
                            ) : a.endMs ? (
                              <div className={`flex items-center gap-1.5 text-xs ${T.textFaint}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>
                                <span className="font-mono">{fmtTS(a.endMs)}</span>
                              </div>
                            ) : null}
                          </div>
                          <InlineNote a={a}/>
                          {isRunning && !selectMode && (
                            <button onClick={()=>endDirectly(a)}
                              className={`mt-2 w-full py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${dark?'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25':'bg-red-50 hover:bg-red-100 text-red-500 border-red-200'}`}>
                              <IcoStop/><span>End</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── MENU OVERLAY + FLOATING DROPDOWN ── */}
      {menuId && <div className="fixed inset-0 z-[45]" onClick={()=>{setMenuId(null);setMenuPos(null)}}/>}
      {menuAct && menuPos && (
        <div className={`fixed z-[46] ${T.surface} border ${T.border} rounded-2xl shadow-2xl w-44 overflow-hidden`}
          style={{top:menuPos.top, right:menuPos.right}}>
          {menuAct.endMs===null && <button onClick={()=>{endDirectly(menuAct);setMenuId(null);setMenuPos(null)}} className={`w-full text-left px-4 py-2.5 text-sm ${T.textSub} hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2.5 transition-colors`}><IcoStop/><span>End Activity</span></button>}
          <button onClick={()=>openEdit(menuAct)} className={`w-full text-left px-4 py-2.5 text-sm ${T.textSub} hover:bg-blue-500/10 hover:text-blue-500 flex items-center gap-2.5 transition-colors`}><IcoEdit/><span>Edit</span></button>
          <button onClick={()=>{setInlineNoteId(menuAct.id);setInlineNoteText(menuAct.notes||'');setMenuId(null);setMenuPos(null)}} className={`w-full text-left px-4 py-2.5 text-sm ${T.textSub} hover:bg-green-500/10 hover:text-green-500 flex items-center gap-2.5 transition-colors`}><IcoNote/><span>Add Note</span></button>
          {!menuAct.groupId && <button onClick={()=>{setSelectMode(true);setSelected(new Set([menuAct.id]));setMenuId(null);setMenuPos(null)}} className={`w-full text-left px-4 py-2.5 text-sm ${T.textSub} hover:bg-purple-500/10 hover:text-purple-500 flex items-center gap-2.5 transition-colors`}><IcoLink/><span>Select to Group</span></button>}
          <button onClick={()=>handleDelete(menuAct.id)} className={`w-full text-left px-4 py-2.5 text-sm ${T.textSub} hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2.5 transition-colors border-t ${T.border}`}><IcoTrash/><span>Delete</span></button>
        </div>
      )}

      {/* ── FLOATING TIMER WIDGET ── */}
      {running.length > 0 && (
        <div
          className={timerDocked ? 'fixed bottom-[5.5rem] md:bottom-6 right-4 z-[999]' : 'fixed z-[999]'}
          style={timerDocked ? {} : {left:timerFreePos.x, top:timerFreePos.y}}
          onMouseDown={e=>{
            if(!timerDocked && timerOpen) {
              timerDragRef.current={ox:timerFreePos.x,oy:timerFreePos.y,bx:e.clientX,by:e.clientY}
              const onMove=(ev:MouseEvent)=>{if(!timerDragRef.current)return;setTimerFreePos({x:timerDragRef.current.ox+(ev.clientX-timerDragRef.current.bx),y:timerDragRef.current.oy+(ev.clientY-timerDragRef.current.by)})}
              const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);timerDragRef.current=null}
              document.addEventListener('mousemove',onMove)
              document.addEventListener('mouseup',onUp)
            }
          }}
        >
          {!timerOpen ? (
            <button onClick={()=>setTimerOpen(true)}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/40 flex flex-col items-center justify-center gap-0.5 transition-colors">
              <IcoClock/>
              <span className="text-[9px] font-bold text-white leading-none">{running.length}</span>
            </button>
          ) : (
            <div className={`${T.surface} border ${T.border} rounded-2xl shadow-2xl w-64 overflow-hidden`}>
              <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${T.border} cursor-move`}>
                <span className={`text-xs font-bold ${T.text} flex-1`}>Running ({running.length})</span>
                <button onClick={()=>setTimerDocked(d=>!d)} className={`text-[10px] font-bold ${T.textFaint} hover:opacity-80 transition-opacity px-1`}>{timerDocked?'Undock':'Dock'}</button>
                <button onClick={()=>setTimerOpen(false)} className={`text-[10px] font-bold ${T.textFaint} hover:text-red-400 transition-colors`}>✕</button>
              </div>
              <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                {running.map(a=>(
                  <div key={a.id} className={`${T.cardInner} border ${T.border} rounded-xl px-3 py-2`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"/>
                      <span className={`text-xs font-medium ${T.textSub} flex-1 truncate`}>{a.category}{a.subcategory!=='No Status'?' › '+a.subcategory:''}</span>
                      <span className={`font-mono text-xs font-bold tabular-nums ${dark?'text-amber-400':'text-amber-600'}`}>{fmtClock(Date.now()-a.startMs)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LOG SHEET ── */}
      {showLogSheet && (
        <Sheet title="Log Activity" onClose={()=>setShowLogSheet(false)} dark={dark} T={T}>
          <FormFields form={logForm} setForm={setLogForm}/>
          <div className="pt-2 pb-4">
            <button onClick={handleLogSubmit} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
              <IcoPlus/><span>Log Activity</span>
            </button>
          </div>
        </Sheet>
      )}

      {/* ── EDIT SHEET ── */}
      {showEditSheet && (
        <Sheet title="Edit Activity" onClose={()=>setShowEditSheet(false)} dark={dark} T={T}>
          <FormFields form={editForm} setForm={setEditForm}/>
          <div className="pt-2 pb-4">
            <button onClick={handleEditSubmit} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
              <IcoEdit/><span>Save Changes</span>
            </button>
          </div>
        </Sheet>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 ${T.surface} border ${T.border} ${T.text} px-5 py-3 rounded-2xl text-sm font-semibold z-50 shadow-2xl flex items-center gap-3 whitespace-nowrap`}>
          <span>{toast.msg}</span>
          {toast.undoFn && (
            <button onClick={()=>{toast.undoFn!();setToast(null)}} className="text-blue-500 font-bold hover:opacity-80 transition-opacity">Undo</button>
          )}
        </div>
      )}
    </div>
  )
}

function Sheet({ title, onClose, dark, T, children }: { title:string; onClose:()=>void; dark:boolean; T:any; children:React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" onClick={onClose}>
      <div className={`absolute inset-0 ${dark?'bg-black/70':'bg-black/40'} backdrop-blur-sm`}/>
      <div className={`relative ${T.surface} border ${T.border} border-b-0 rounded-t-3xl w-full max-w-2xl flex flex-col shadow-2xl`}
        style={{maxHeight:'90vh'}} onClick={e=>e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className={`w-10 h-1 rounded-full ${dark?'bg-[#2A3340]':'bg-gray-200'}`}/>
        </div>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${T.border} flex-shrink-0`}>
          <h3 className={`text-base font-bold ${T.text}`}>{title}</h3>
          <button onClick={onClose}
            className={`w-8 h-8 rounded-xl ${T.cardInner} border ${T.border} flex items-center justify-center ${T.textSub} hover:opacity-80 transition-opacity`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" onClick={e=>e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  )
}
