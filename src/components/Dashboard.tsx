import { useState, useEffect, useCallback, useRef } from 'react'
import { CATEGORIES, ACTIVITY_DONE_AT, ACTIVITY_LOGGED_FROM, ACTIVITY_LOGGED_VIA } from '../types/categories'

// ─── helpers ─────────────────────────────────────────────────────────────────
const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MON = ['January','February','March','April','May','June','July','August','September','October','November','December']
const pad = (n: number) => String(n).padStart(2,'0')

function todayKey() { return dkey(new Date()) }
function dkey(d: Date) { return pad(d.getDate()) + '-' + pad(d.getMonth()+1) + '-' + d.getFullYear() }
function keyToDate(k: string) {
  const [dd,mm,yyyy] = k.split('-').map(Number)
  return new Date(yyyy, mm-1, dd)
}
function fmtTS(ms: number) {
  const d = new Date(ms)
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12
  return DOW[d.getDay()] + ', ' + pad(d.getDate()) + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear()
    + ' - ' + pad(h) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + ap
}
function fmtClock(ms: number) {
  const s = Math.floor(Math.abs(ms)/1000)
  return pad(Math.floor(s/3600)) + ':' + pad(Math.floor((s%3600)/60)) + ':' + pad(s%60)
}
function fmtDur(ms: number) {
  if (ms < 0) ms = 0
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h > 0) return h + 'h ' + m + 'm'
  if (m > 0) return m + 'm ' + sec + 's'
  return sec + 's'
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

// ─── types ────────────────────────────────────────────────────────────────────
interface LocalActivity {
  id: string
  startMs: number
  endMs: number | null
  category: string
  subcategory: string
  activityDoneAt: string
  activityType: 'Main' | 'Parallel'
  hasStartTimestamp: boolean
  hasEndTimestamp: boolean
  hasNotes: boolean
  notes: string
  loggedFrom: string
  loggedVia: string
  groupId: string | null
  activityNumber: number
  subIndex: number | null
}

type DayData = Record<string, LocalActivity[]>

const initForm = () => ({
  category: 'No Status',
  subcategory: 'No Status',
  activityDoneAt: 'No Status',
  activityType: 'Main' as 'Main' | 'Parallel',
  hasStartTimestamp: true,
  hasEndTimestamp: false,
  hasNotes: false,
  notes: '',
  loggedFrom: 'Daily Activity Log Web App (PWA)',
  loggedVia: 'Daily Activity Log Web App (PWA)',
})

// ─── component ────────────────────────────────────────────────────────────────
interface Props {
  userEmail: string
  onSignOut: () => void
}

export default function Dashboard({ userEmail, onSignOut }: Props) {
  const [dark, setDark] = useState(true)
  const [viewDate, setViewDate] = useState(todayKey())
  const [days, setDays] = useState<DayData>({})
  const [_tick, setTick] = useState(0)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  // sheets
  const [showLogSheet, setShowLogSheet] = useState(false)
  const [showEndSheet, setShowEndSheet] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [pendingActivity, setPendingActivity] = useState<ReturnType<typeof initForm>|null>(null)
  const [endingId, setEndingId] = useState<string|null>(null)
  const [endForm, setEndForm] = useState(initForm())
  const [logForm, setLogForm] = useState(initForm())

  // tick
  useEffect(() => {
    const t = setInterval(() => setTick(n => n+1), 1000)
    return () => clearInterval(t)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2500)
  }, [])

  const dayActs = days[viewDate] || []
  const running = dayActs.filter(a => a.endMs === null)
  const isToday = viewDate === todayKey()
  const dateObj = keyToDate(viewDate)

  const shiftDay = (n: number) => {
    const d = keyToDate(viewDate); d.setDate(d.getDate() + n); setViewDate(dkey(d))
  }

  // ── compute display groups ──────────────────────────────────────────────────
  // Returns array of { type: 'solo'|'group', acts: LocalActivity[], number: number }
  const computeDisplayItems = (acts: LocalActivity[]) => {
    const sorted = [...acts].sort((a,b) => b.startMs - a.startMs)
    const groups: Map<string, LocalActivity[]> = new Map()
    const solos: LocalActivity[] = []
    sorted.forEach(a => {
      if (a.groupId) {
        if (!groups.has(a.groupId)) groups.set(a.groupId, [])
        groups.get(a.groupId)!.push(a)
      } else {
        solos.push(a)
      }
    })
    // build display list newest first
    const items: Array<{type:'solo'|'group', acts:LocalActivity[], displayNum:number}> = []
    sorted.forEach(a => {
      if (!a.groupId) {
        items.push({ type:'solo', acts:[a], displayNum: a.activityNumber })
      } else {
        // only add group once
        if (!items.find(i => i.type==='group' && i.acts[0].groupId === a.groupId)) {
          const grp = groups.get(a.groupId)!
          items.push({ type:'group', acts: grp.sort((x,y)=>x.subIndex!-y.subIndex!), displayNum: a.activityNumber })
        }
      }
    })
    return items
  }

  // ── log activity ──────────────────────────────────────────────────────────
  const handleLogSubmit = () => {
    const form = logForm
    const existing = days[viewDate] || []
    const runningNow = existing.filter(a => a.endMs === null)

    if (runningNow.length > 0) {
      // ask about grouping
      setPendingActivity(form)
      setShowLogSheet(false)
      setShowGroupDialog(true)
      return
    }

    // no running — log as independent
    saveNewActivity(form, null, null)
    setShowLogSheet(false)
    setLogForm(initForm())
  }

  const saveNewActivity = (form: ReturnType<typeof initForm>, groupId: string|null, subIndex: number|null) => {
    const now = Date.now()
    const existing = days[viewDate] || []
    // compute activity number
    const topLevelCount = existing.filter(a => a.subIndex === null).length
    const actNum = subIndex !== null
      ? existing.find(a => a.groupId === groupId && a.subIndex === 1)?.activityNumber || topLevelCount + 1
      : topLevelCount + 1

    const newAct: LocalActivity = {
      id: uid(),
      startMs: form.hasStartTimestamp ? now : 0,
      endMs: null,
      category: form.category,
      subcategory: form.subcategory,
      activityDoneAt: form.activityDoneAt,
      activityType: form.activityType,
      hasStartTimestamp: form.hasStartTimestamp,
      hasEndTimestamp: false,
      hasNotes: form.hasNotes,
      notes: form.hasNotes ? form.notes : '',
      loggedFrom: form.loggedFrom,
      loggedVia: form.loggedVia,
      groupId,
      activityNumber: actNum,
      subIndex,
    }
    setDays(prev => ({ ...prev, [viewDate]: [...(prev[viewDate]||[]), newAct] }))
    showToast('Activity logged!')
    setLogForm(initForm())
  }

  // group dialog responses
  const handleGroupYes = () => {
    if (!pendingActivity) return
    const existing = days[viewDate] || []
    const runningNow = existing.filter(a => a.endMs === null)
    // find or create group
    let groupId = runningNow[0].groupId
    if (!groupId) {
      // convert first running to group
      groupId = uid()
      const firstRunning = runningNow[0]
      const subIdx = 1
      setDays(prev => ({
        ...prev,
        [viewDate]: (prev[viewDate]||[]).map(a =>
          a.id === firstRunning.id ? { ...a, groupId, subIndex: subIdx } : a
        )
      }))
    }
    // count existing sub members
    const existingMembers = (days[viewDate]||[]).filter(a => a.groupId === groupId)
    const nextSub = existingMembers.length + 1
    saveNewActivity(pendingActivity, groupId, nextSub)
    setShowGroupDialog(false)
    setPendingActivity(null)
  }

  const handleGroupNo = () => {
    if (!pendingActivity) return
    saveNewActivity(pendingActivity, null, null)
    setShowGroupDialog(false)
    setPendingActivity(null)
  }

  // ── end activity ──────────────────────────────────────────────────────────
  const openEndSheet = (id: string) => {
    const act = dayActs.find(a => a.id === id)
    if (!act) return
    setEndingId(id)
    setEndForm({
      category: act.category,
      subcategory: act.subcategory,
      activityDoneAt: act.activityDoneAt,
      activityType: act.activityType,
      hasStartTimestamp: act.hasStartTimestamp,
      hasEndTimestamp: true,
      hasNotes: act.hasNotes,
      notes: act.notes,
      loggedFrom: act.loggedFrom,
      loggedVia: act.loggedVia,
    })
    setShowEndSheet(true)
  }

  const handleEndSubmit = () => {
    if (!endingId) return
    setDays(prev => ({
      ...prev,
      [viewDate]: (prev[viewDate]||[]).map(a =>
        a.id === endingId ? {
          ...a,
          endMs: Date.now(),
          category: endForm.category,
          subcategory: endForm.subcategory,
          activityDoneAt: endForm.activityDoneAt,
          activityType: endForm.activityType,
          hasNotes: endForm.hasNotes,
          notes: endForm.hasNotes ? endForm.notes : '',
          loggedFrom: endForm.loggedFrom,
          loggedVia: endForm.loggedVia,
        } : a
      )
    }))
    showToast('Activity ended!')
    setShowEndSheet(false)
    setEndingId(null)
  }

  // ── theme classes ──────────────────────────────────────────────────────────
  const bg = dark ? 'bg-gray-950' : 'bg-gray-100'
  const panel = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  const panelInner = dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
  const text = dark ? 'text-white' : 'text-gray-900'
  const dim = dark ? 'text-gray-400' : 'text-gray-500'
  const faint = dark ? 'text-gray-600' : 'text-gray-400'
  const selectCls = `w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`

  const displayItems = computeDisplayItems(dayActs)

  return (
    <div className={`min-h-screen ${bg} ${text} pb-28 transition-colors`}>

      {/* ── header ── */}
      <header className={`${panel} border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400">⏱</span>
          </div>
          <span className="font-bold text-sm">Daily Activity Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${faint} text-xs hidden sm:block`}>{userEmail}</span>
          <button
            onClick={() => setDark(d => !d)}
            className={`w-8 h-8 rounded-lg ${panelInner} border flex items-center justify-center text-sm`}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onSignOut}
            className={`text-xs ${panelInner} border px-3 py-1.5 rounded-lg`}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">

        {/* ── date bar ── */}
        <div className={`flex items-center gap-2 ${panel} border rounded-xl p-2`}>
          <button onClick={() => shiftDay(-1)} className={`w-10 h-10 rounded-lg ${panelInner} border flex items-center justify-center flex-shrink-0 text-lg`}>‹</button>
          <div className="flex-1 text-center">
            <div className={`text-xs font-bold tracking-widest ${faint} uppercase`}>{DOW[dateObj.getDay()]}</div>
            <div className="text-base font-bold">{dateObj.getDate()} {MON[dateObj.getMonth()]} {dateObj.getFullYear()}</div>
          </div>
          <button onClick={() => shiftDay(1)} className={`w-10 h-10 rounded-lg ${panelInner} border flex items-center justify-center flex-shrink-0 text-lg`}>›</button>
          {!isToday && (
            <button onClick={() => setViewDate(todayKey())} className={`text-xs font-bold text-blue-400 ${panelInner} border rounded-lg px-3 h-10 flex-shrink-0`}>Today</button>
          )}
        </div>

        {/* ── running banners — one per running activity ── */}
        {running.map(a => (
          <div key={a.id} className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">Running</div>
              <div className={`text-sm ${dim} truncate`}>{a.category}{a.subcategory !== 'No Status' ? ' › '+a.subcategory : ''}</div>
            </div>
            <div className="font-mono text-lg font-bold text-amber-400 flex-shrink-0">
              {fmtClock(Date.now() - a.startMs)}
            </div>
          </div>
        ))}

        {/* ── stats ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: dayActs.length },
            { label: 'Running', value: running.length },
            { label: 'Ended', value: dayActs.filter(a => a.endMs !== null).length },
            { label: 'Groups', value: new Set(dayActs.filter(a=>a.groupId).map(a=>a.groupId)).size },
          ].map(s => (
            <div key={s.label} className={`${panel} border rounded-xl p-3 text-center`}>
              <div className="font-mono text-lg font-bold">{s.value}</div>
              <div className={`text-xs font-bold tracking-wider ${faint} uppercase mt-0.5`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── activity list ── */}
        <div>
          <div className="flex items-baseline gap-2 mb-2 px-1">
            <h2 className={`text-xs font-bold tracking-widest ${faint} uppercase`}>{isToday ? "Today's Activities" : "Activities"}</h2>
            {dayActs.length > 0 && <span className={`font-mono text-xs ${faint}`}>{dayActs.length} total</span>}
          </div>

          {dayActs.length === 0 ? (
            <div className={`text-center py-12 ${faint}`}>
              <div className="text-4xl mb-3">⏱️</div>
              <div>No activities yet.</div>
              <div className="text-sm mt-1">Tap <span className="text-blue-400">+ Log Activity</span> to start.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {displayItems.map((item) => {
                if (item.type === 'solo') {
                  const a = item.acts[0]
                  const isRunning = a.endMs === null
                  const elapsed = isRunning ? Date.now() - a.startMs : (a.endMs! - a.startMs)
                  const isMain = a.activityType === 'Main'
                  return (
                    <div key={a.id} className={`${panel} border rounded-xl p-3 ${isRunning ? 'border-amber-500/50' : isMain ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${faint} ${panelInner} border rounded-lg px-2 py-1 flex-shrink-0`}>
                          #{a.activityNumber}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${isMain ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {a.activityType}
                        </span>
                        {a.activityDoneAt !== 'No Status' && (
                          <span className={`text-xs ${panelInner} border px-2 py-1 rounded-lg ${dim} flex-shrink-0`}>{a.activityDoneAt}</span>
                        )}
                        <span className={`font-mono text-sm font-bold ml-auto flex-shrink-0 ${isRunning ? 'text-amber-400' : 'text-green-400'}`}>
                          {isRunning ? fmtClock(elapsed) : fmtDur(elapsed)}{isRunning ? ' ⏳' : ''}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`font-semibold text-sm ${text}`}>{a.category}</span>
                        {a.subcategory !== 'No Status' && <span className={`text-sm ${dim}`}> › {a.subcategory}</span>}
                      </div>
                      <div className="mt-2 space-y-1">
                        {a.hasStartTimestamp && a.startMs > 0 && (
                          <div className={`flex items-center gap-2 text-xs ${dim}`}>
                            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                            <span className="font-mono text-xs">{fmtTS(a.startMs)}</span>
                          </div>
                        )}
                        {isRunning ? (
                          <div className="flex items-center gap-2 text-xs text-amber-500/70">
                            <span className="w-2 h-2 rounded-full border border-amber-500 flex-shrink-0" />
                            <span>still running…</span>
                          </div>
                        ) : a.endMs ? (
                          <div className={`flex items-center gap-2 text-xs ${dim}`}>
                            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                            <span className="font-mono text-xs">{fmtTS(a.endMs)}</span>
                          </div>
                        ) : null}
                      </div>
                      {a.hasNotes && a.notes && (
                        <div className={`mt-2 text-xs ${dim} ${panelInner} border rounded-lg px-3 py-2`}>{a.notes}</div>
                      )}
                      {isRunning && (
                        <button
                          onClick={() => openEndSheet(a.id)}
                          className="mt-3 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold rounded-lg transition-colors border border-red-500/30"
                        >
                          ⏹ End Activity
                        </button>
                      )}
                    </div>
                  )
                }

                // GROUP
                const grp = item.acts
                const groupRunning = grp.some(a => a.endMs === null)
                const groupStartMs = Math.min(...grp.map(a => a.startMs))
                const groupEndMs = groupRunning ? null : Math.max(...grp.map(a => a.endMs!))
                const groupElapsed = groupRunning ? Date.now() - groupStartMs : groupEndMs! - groupStartMs

                return (
                  <div key={grp[0].groupId} className={`${panel} border rounded-xl overflow-hidden ${groupRunning ? 'border-amber-500/40' : 'border-purple-500/30'}`}>
                    {/* group header */}
                    <div className={`${dark ? 'bg-purple-500/10' : 'bg-purple-50'} border-b ${dark ? 'border-purple-500/20' : 'border-purple-200'} px-3 py-2 flex items-center gap-2`}>
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-lg">#{item.displayNum} GROUP</span>
                      <span className={`text-xs ${dim}`}>{grp.length} activities</span>
                      <span className={`font-mono text-sm font-bold ml-auto ${groupRunning ? 'text-amber-400' : 'text-green-400'}`}>
                        {groupRunning ? fmtClock(groupElapsed) : fmtDur(groupElapsed)}
                        {groupRunning ? ' ⏳' : ''}
                      </span>
                    </div>

                    {/* sub activities */}
                    <div className="divide-y divide-gray-800/50">
                      {grp.map(a => {
                        const isRunning = a.endMs === null
                        const elapsed = isRunning ? Date.now() - a.startMs : (a.endMs! - a.startMs)
                        const isMain = a.activityType === 'Main'
                        return (
                          <div key={a.id} className={`px-3 py-2.5 ${isMain ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-amber-500'}`}>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-xs font-bold ${faint}`}>
                                #{item.displayNum}.{a.subIndex}
                              </span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMain ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {a.activityType}
                              </span>
                              <span className={`font-mono text-xs font-bold ml-auto ${isRunning ? 'text-amber-400' : 'text-green-400'}`}>
                                {isRunning ? fmtClock(elapsed) : fmtDur(elapsed)}{isRunning ? ' ⏳':''}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-sm font-semibold ${text}`}>{a.category}</span>
                              {a.subcategory !== 'No Status' && <span className={`text-sm ${dim}`}> › {a.subcategory}</span>}
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {a.hasStartTimestamp && a.startMs > 0 && (
                                <div className={`flex items-center gap-1.5 text-xs ${dim}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                  <span className="font-mono">{fmtTS(a.startMs)}</span>
                                </div>
                              )}
                              {isRunning ? (
                                <div className="flex items-center gap-1.5 text-xs text-amber-500/70">
                                  <span className="w-1.5 h-1.5 rounded-full border border-amber-500 flex-shrink-0" />
                                  <span>still running…</span>
                                </div>
                              ) : a.endMs ? (
                                <div className={`flex items-center gap-1.5 text-xs ${dim}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                  <span className="font-mono">{fmtTS(a.endMs)}</span>
                                </div>
                              ) : null}
                            </div>
                            {a.hasNotes && a.notes && (
                              <div className={`mt-1.5 text-xs ${dim} ${panelInner} border rounded-lg px-2 py-1.5`}>{a.notes}</div>
                            )}
                            {isRunning && (
                              <button
                                onClick={() => openEndSheet(a.id)}
                                className="mt-2 w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors border border-red-500/30"
                              >
                                ⏹ End
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div className={`fixed bottom-0 left-0 right-0 ${panel} border-t p-4 z-20`}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowLogSheet(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base"
          >
            + Log Activity
          </button>
        </div>
      </div>

      {/* ── group dialog ── */}
      {showGroupDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setShowGroupDialog(false); setPendingActivity(null) }} />
          <div className={`relative ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-sm space-y-4`}>
            <div className="text-center">
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="font-bold text-lg">Group with running activity?</h3>
              <p className={`text-sm ${dim} mt-1`}>There {running.length === 1 ? 'is' : 'are'} {running.length} activity currently running. Add this as a grouped sub-activity?</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleGroupYes}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
              >
                Yes — Add to Group
              </button>
              <button
                onClick={handleGroupNo}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                No — Log as Independent
              </button>
              <button
                onClick={() => { setShowGroupDialog(false); setPendingActivity(null) }}
                className={`w-full py-3 ${panelInner} border font-bold rounded-xl transition-colors ${dim}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── log activity sheet ── */}
      {showLogSheet && (
        <BottomSheet title="Log Activity" onClose={() => setShowLogSheet(false)} dark={dark} panel={panel} panelInner={panelInner} dim={dim} selectCls={selectCls}>
          <ActivityFormFields form={logForm} setForm={setLogForm} selectCls={selectCls} dim={dim} dark={dark} panelInner={panelInner} />
          <button onClick={handleLogSubmit} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
            Log Activity
          </button>
        </BottomSheet>
      )}

      {/* ── end activity sheet ── */}
      {showEndSheet && (
        <BottomSheet title="End Activity" onClose={() => setShowEndSheet(false)} dark={dark} panel={panel} panelInner={panelInner} dim={dim} selectCls={selectCls}>
          <ActivityFormFields form={endForm} setForm={setEndForm} selectCls={selectCls} dim={dim} dark={dark} panelInner={panelInner} />
          <button onClick={handleEndSubmit} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
            ⏹ End &amp; Save
          </button>
        </BottomSheet>
      )}

      {/* ── toast ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white px-5 py-3 rounded-xl text-sm font-semibold z-50 whitespace-nowrap shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── bottom sheet wrapper ─────────────────────────────────────────────────────
function BottomSheet({ title, onClose, dark: _dark, panel, panelInner: _panelInner, dim, selectCls: _selectCls, children }: {
  title: string; onClose: () => void; dark: boolean; panel: string; panelInner: string; dim: string; selectCls: string; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className={`relative ${panel} border rounded-t-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className={`${dim} hover:text-white text-2xl leading-none`}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── form fields ──────────────────────────────────────────────────────────────
function ActivityFormFields({ form, setForm, selectCls, dim, dark, panelInner: _panelInner }: {
  form: ReturnType<typeof initForm>
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof initForm>>>
  selectCls: string; dim: string; dark: boolean; panelInner: string
}) {
  const label = (t: string) => <label className={`text-xs font-bold tracking-wider ${dim} uppercase`}>{t}</label>
  const toggle = (val: boolean, onChange: () => void) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${val ? 'bg-blue-600' : dark ? 'bg-gray-700' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${val ? 'left-6' : 'left-0.5'}`} />
    </button>
  )

  return (
    <>
      <div className="space-y-1">
        {label('Category')}
        <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value, subcategory: 'No Status'}))} className={selectCls}>
          {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        {label('Subcategory')}
        <select value={form.subcategory} onChange={e => setForm(f => ({...f, subcategory: e.target.value}))} className={selectCls}>
          {(CATEGORIES[form.category]||['No Status']).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        {label('Activity Done At')}
        <select value={form.activityDoneAt} onChange={e => setForm(f => ({...f, activityDoneAt: e.target.value}))} className={selectCls}>
          {ACTIVITY_DONE_AT.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        {label('Activity Type')}
        <div className="flex gap-2">
          {(['Main','Parallel'] as const).map(t => (
            <button key={t} onClick={() => setForm(f => ({...f, activityType: t}))}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${form.activityType === t ? t==='Main' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-gray-900' : dark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {label('Has Start Timestamp')}
        {toggle(form.hasStartTimestamp, () => setForm(f => ({...f, hasStartTimestamp: !f.hasStartTimestamp})))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {label('Has Notes')}
          {toggle(form.hasNotes, () => setForm(f => ({...f, hasNotes: !f.hasNotes})))}
        </div>
        {form.hasNotes && (
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            placeholder="Enter notes..." rows={3}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
          />
        )}
      </div>
      <div className="space-y-1">
        {label('Logged From')}
        <select value={form.loggedFrom} onChange={e => setForm(f => ({...f, loggedFrom: e.target.value}))} className={selectCls}>
          {ACTIVITY_LOGGED_FROM.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        {label('Logged Via')}
        <select value={form.loggedVia} onChange={e => setForm(f => ({...f, loggedVia: e.target.value}))} className={selectCls}>
          {ACTIVITY_LOGGED_VIA.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </>
  )
}
