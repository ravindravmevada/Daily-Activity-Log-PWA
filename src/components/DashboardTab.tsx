import { useState, useEffect, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useActivityStore } from '../store/activityStore'
import type { LocalActivity } from '../store/activityStore'
import { CATEGORIES } from '../types/categories'
import { todayKey, dkey, fmtClock, fmtDur, DOW, MON } from '../utils/helpers'

// ── palette ───────────────────────────────────────────────────────────────────
const PALETTE = ['#3B82F6','#F59E0B','#10B981','#8B5CF6','#EF4444','#06B6D4','#F97316','#EC4899']
const CAT_KEYS = Object.keys(CATEGORIES)

function getCategoryColor(cat: string): string {
  const idx = CAT_KEYS.indexOf(cat)
  return PALETTE[Math.max(0, idx) % PALETTE.length]
}

// ── pure helpers ──────────────────────────────────────────────────────────────
function getTotalDuration(acts: LocalActivity[]): number {
  return acts.filter(a => a.endMs !== null).reduce((sum, a) => sum + (a.endMs! - a.startMs), 0)
}

function fmtHour(h: number): string {
  if (h === 0) return '12AM'
  if (h < 12) return `${h}AM`
  if (h === 12) return '12PM'
  return `${h - 12}PM`
}

function formatDateLong(d: Date): string {
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  return 'Good evening'
}

function computeStreak(days: Record<string, LocalActivity[]>): number {
  let streak = 0
  const d = new Date()
  for (;;) {
    const k = dkey(d)
    if ((days[k] || []).some(a => a.endMs !== null)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  return streak
}

// ── icons ─────────────────────────────────────────────────────────────────────
const IcoClipboard = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
const IcoClock    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcoPlay     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
const IcoCalendar = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcoTrophy   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9H3V4h3"/><path d="M18 9h3V4h-3"/><path d="M6 3h12v7a6 6 0 0 1-12 0V3z"/><line x1="12" y1="16" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
const IcoTag      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/></svg>
const IcoDatabase = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
const IcoSun      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const IcoMoon     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const IcoChevR    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>

// ── props ─────────────────────────────────────────────────────────────────────
interface Props {
  userEmail: string
  onSignOut: () => void
  dark: boolean
  onToggleDark: () => void
}

type SortCol = 'count' | 'totalMs' | 'avgMs'

export default function DashboardTab({ userEmail: _u, onSignOut: _s, dark, onToggleDark }: Props) {
  const { days } = useActivityStore()
  const [, setTick] = useState(0)
  const [sortCol, setSortCol] = useState<SortCol>('totalMs')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // ── theme tokens (exact copy from LogTab) ─────────────────────────────────
  const T = dark ? {
    bg:        'bg-[#0D1117]',
    surface:   'bg-[#151B23]',
    card:      'bg-[#151B23]',
    cardInner: 'bg-[#1B2330]',
    border:    'border-[#2A3340]',
    text:      'text-[#E6EDF3]',
    textSub:   'text-[#8B98A9]',
    textFaint: 'text-[#5C6878]',
    mainChip:  'bg-blue-500/20 text-blue-300 border-blue-500/40',
    parChip:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    runBorder: 'border-amber-500/40',
    runBg:     'bg-amber-500/8',
    runGlow:   '0 0 24px rgba(245,181,68,0.12)',
    shadow:    'shadow-lg shadow-black/20',
    surfaceRaw:'#151B23',
    borderRaw: '#2A3340',
    textRaw:   '#E6EDF3',
    faintRaw:  '#5C6878',
    stripeBg:  'bg-[#1B2330]/50',
  } : {
    bg:        'bg-[#F4F6F9]',
    surface:   'bg-white',
    card:      'bg-white',
    cardInner: 'bg-gray-50',
    border:    'border-gray-200',
    text:      'text-gray-900',
    textSub:   'text-gray-500',
    textFaint: 'text-gray-400',
    mainChip:  'bg-blue-50 text-blue-600 border-blue-200',
    parChip:   'bg-amber-50 text-amber-600 border-amber-200',
    runBorder: 'border-amber-300',
    runBg:     'bg-amber-50',
    runGlow:   '0 4px 20px rgba(245,181,68,0.15)',
    shadow:    'shadow-sm shadow-gray-200',
    surfaceRaw:'#FFFFFF',
    borderRaw: '#E5E7EB',
    textRaw:   '#111827',
    faintRaw:  '#9CA3AF',
    stripeBg:  'bg-gray-50/70',
  }

  // ── derived data ──────────────────────────────────────────────────────────
  const todayK = todayKey()
  const todayActs  = useMemo((): LocalActivity[] => days[todayK] || [], [days, todayK])
  const running    = useMemo(() => todayActs.filter(a => a.endMs === null), [todayActs])
  const endedToday = useMemo(() => todayActs.filter(a => a.endMs !== null), [todayActs])
  const allActs    = useMemo(() => Object.values(days).flat(), [days])
  const todayTotalMs   = useMemo(() => getTotalDuration(todayActs), [todayActs])
  const totalDaysLogged = useMemo(() => Object.keys(days).length, [days])
  const streak         = useMemo(() => computeStreak(days), [days])
  const totalTimeAll   = useMemo(() => getTotalDuration(allActs), [allActs])

  const longestEver = useMemo(() => {
    const ended = allActs.filter(a => a.endMs !== null)
    if (!ended.length) return null
    return ended.reduce((b, a) => (a.endMs! - a.startMs) > (b.endMs! - b.startMs) ? a : b)
  }, [allActs])

  const mostActiveCat = useMemo(() => {
    const counts: Record<string, number> = {}
    allActs.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1 })
    const entries = Object.entries(counts)
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0] : null
  }, [allActs])

  // ── pie chart data ────────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const bycat: Record<string, number> = {}
    endedToday.forEach(a => { bycat[a.category] = (bycat[a.category] || 0) + (a.endMs! - a.startMs) })
    return Object.entries(bycat).map(([cat, ms]) => ({name: cat, value: ms, color: getCategoryColor(cat)}))
  }, [endedToday])

  // ── bar chart (24-hour timeline) ──────────────────────────────────────────
  const timelineData = useMemo(() => {
    const buckets = Array.from({length: 24}, (_, h) => ({
      hour: h, label: fmtHour(h), minutes: 0, color: PALETTE[0], cats: [] as string[],
    }))
    endedToday.forEach(a => {
      const h = new Date(a.startMs).getHours()
      buckets[h].minutes += (a.endMs! - a.startMs) / 60000
      buckets[h].cats.push(a.category)
    })
    return buckets.map(b => {
      if (!b.cats.length) return {hour: b.hour, label: b.label, minutes: 0, color: 'transparent'}
      const freq: Record<string, number> = {}
      b.cats.forEach(c => { freq[c] = (freq[c] || 0) + 1 })
      const top = Object.entries(freq).sort((a, z) => z[1] - a[1])[0][0]
      return {hour: b.hour, label: b.label, minutes: Math.round(b.minutes * 10) / 10, color: getCategoryColor(top)}
    })
  }, [endedToday])

  // ── category table ────────────────────────────────────────────────────────
  const catRows = useMemo(() => {
    const bycat: Record<string, {count: number, totalMs: number}> = {}
    todayActs.forEach(a => {
      if (!bycat[a.category]) bycat[a.category] = {count: 0, totalMs: 0}
      bycat[a.category].count++
      if (a.endMs !== null) bycat[a.category].totalMs += a.endMs - a.startMs
    })
    const maxMs = Math.max(...Object.values(bycat).map(v => v.totalMs), 1)
    return Object.entries(bycat)
      .map(([cat, v]) => ({
        cat, count: v.count, totalMs: v.totalMs,
        avgMs: v.count > 0 ? Math.round(v.totalMs / v.count) : 0,
        pct: (v.totalMs / maxMs) * 100,
        color: getCategoryColor(cat),
      }))
      .sort((a, b) => sortAsc ? a[sortCol] - b[sortCol] : b[sortCol] - a[sortCol])
  }, [todayActs, sortCol, sortAsc])

  // ── 7-day heatmap ─────────────────────────────────────────────────────────
  const last7 = useMemo(() => Array.from({length: 7}, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const k = dkey(d)
    return {key: k, abbr: DOW[d.getDay()].slice(0, 3), num: d.getDate(), count: (days[k] || []).length, isToday: k === todayK}
  }), [days, todayK])

  // ── recent activities (last 10 across all days) ───────────────────────────
  const recentActs = useMemo(() =>
    Object.entries(days)
      .flatMap(([date, acts]) => acts.map(a => ({...a, dateKey: date})))
      .sort((a, b) => b.startMs - a.startMs)
      .slice(0, 10),
  [days])

  // ── recharts tooltip style ────────────────────────────────────────────────
  const ttStyle: React.CSSProperties = {
    background: T.surfaceRaw,
    border: `1px solid ${T.borderRaw}`,
    borderRadius: '12px',
    fontSize: '11px',
    color: T.textRaw,
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
  }

  // ── sort toggle ───────────────────────────────────────────────────────────
  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortAsc(a => !a)
    else { setSortCol(col); setSortAsc(false) }
  }
  const sortIndicator = (col: SortCol) => sortCol === col ? (sortAsc ? ' ↑' : ' ↓') : ''

  // ── heatmap cell color ────────────────────────────────────────────────────
  const heatCls = (count: number, isToday: boolean) => {
    if (isToday) return dark ? 'bg-blue-500/20 border-blue-500/50' : 'bg-blue-50 border-blue-400'
    if (count === 0) return dark ? 'bg-[#1B2330] border-[#2A3340]' : 'bg-gray-100 border-gray-200'
    if (count <= 3) return dark ? 'bg-green-900/40 border-green-700/30' : 'bg-green-100 border-green-300'
    if (count <= 7) return dark ? 'bg-green-700/50 border-green-500/40' : 'bg-green-300 border-green-400'
    return dark ? 'bg-green-500/60 border-green-400/50' : 'bg-green-500 border-green-600'
  }

  // ── badge cut-out ring helper ─────────────────────────────────────────────
  const ring = (glow: string) => `0 0 0 3px ${T.surfaceRaw}, 0 4px 14px ${glow}`

  const today = new Date()

  return (
    <div className={`min-h-screen ${T.bg}`}>

      {/* ── mobile header ─────────────────────────────────────────────── */}
      <div className={`md:hidden sticky top-0 z-20 ${T.surface} border-b ${T.border} flex items-center justify-between px-4 h-12`}>
        <span className={`text-sm font-bold ${T.text}`}>Dashboard</span>
        <button onClick={onToggleDark}
          className={`w-8 h-8 rounded-lg border ${T.border} ${T.cardInner} flex items-center justify-center ${T.textSub} hover:opacity-80 transition-opacity`}>
          {dark ? <IcoSun/> : <IcoMoon/>}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S1 — HERO HEADER                                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`rounded-2xl border ${T.border} ${T.shadow} overflow-hidden`}
          style={{background: dark
            ? 'linear-gradient(135deg,#151B23 0%,#1B2330 55%,#1a1f40 100%)'
            : 'linear-gradient(135deg,#FFFFFF 0%,#EFF6FF 55%,#EDE9FE 100%)'}}>
          <div className="px-6 pt-6 pb-2">
            <div className={`text-[11px] font-bold tracking-[1.5px] uppercase mb-1 ${T.textFaint}`}>{formatDateLong(today)}</div>
            <h1 className={`text-2xl font-bold ${T.text}`}>{getGreeting()}, Ravindra</h1>
          </div>
          <div className="px-6 pb-6 pt-6">
            <div className="pt-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([
                  {
                    label:'Activities Today', value: String(todayActs.length),
                    icon:<IcoClipboard/>, badgeCls:'bg-blue-500',
                    numCls: dark?'text-blue-400':'text-blue-600',
                    lblCls: dark?'text-blue-400/70':'text-blue-500',
                    cardCls: dark?'bg-blue-500/15 border-blue-500/30':'bg-blue-50 border-blue-200',
                    glow:'rgba(59,130,246,0.45)',
                  },
                  {
                    label:'Time Logged Today', value: todayTotalMs > 0 ? fmtDur(todayTotalMs) : '0s',
                    icon:<IcoClock/>, badgeCls:'bg-green-500',
                    numCls: dark?'text-green-400':'text-green-600',
                    lblCls: dark?'text-green-400/70':'text-green-500',
                    cardCls: dark?'bg-green-500/15 border-green-500/30':'bg-green-50 border-green-200',
                    glow:'rgba(16,185,129,0.45)',
                  },
                  {
                    label:'Currently Running', value: String(running.length),
                    icon:<IcoPlay/>,
                    badgeCls: running.length>0 ? 'bg-amber-500' : (dark?'bg-[#1B2330]':'bg-gray-300'),
                    numCls: running.length>0 ? (dark?'text-amber-400':'text-amber-600') : T.textFaint,
                    lblCls: running.length>0 ? (dark?'text-amber-400/70':'text-amber-500') : T.textFaint,
                    cardCls: running.length>0 ? (dark?'bg-amber-500/15 border-amber-500/30':'bg-amber-50 border-amber-200') : `${T.surface} ${T.border}`,
                    glow: running.length>0 ? 'rgba(245,158,11,0.45)' : 'transparent',
                  },
                  {
                    label:'Days Logged Total', value: String(totalDaysLogged),
                    icon:<IcoCalendar/>, badgeCls:'bg-purple-500',
                    numCls: dark?'text-purple-400':'text-purple-600',
                    lblCls: dark?'text-purple-400/70':'text-purple-500',
                    cardCls: dark?'bg-purple-500/15 border-purple-500/30':'bg-purple-50 border-purple-200',
                    glow:'rgba(139,92,246,0.45)',
                  },
                ] as const).map(s => (
                  <div key={s.label} className={`relative border rounded-2xl px-2 pt-9 pb-3 flex flex-col items-center gap-1.5 ${T.shadow} ${s.cardCls}`}>
                    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${s.badgeCls}`}
                      style={{boxShadow: ring(s.glow)}}>
                      {s.icon}
                    </div>
                    <div className={`font-mono text-2xl font-bold leading-none tabular-nums ${s.numCls}`}>{s.value}</div>
                    <div className={`text-[8.5px] font-bold tracking-[0.8px] uppercase leading-tight text-center ${s.lblCls}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S2 — LIVE RUNNING ACTIVITIES (only if any running)             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {running.length > 0 && (
          <div className={`${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
            <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Live Activities</div>
            <div className="space-y-2">
              {running.map(a => (
                <div key={a.id}
                  className={`${T.runBg} border ${T.runBorder} rounded-xl px-4 py-3 flex items-center gap-3`}
                  style={{boxShadow: T.runGlow}}>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${T.text}`}>{a.category}</span>
                    {a.subcategory !== 'No Status' && (
                      <span className={`text-sm ${T.textSub} ml-1.5`}>› {a.subcategory}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${a.activityType === 'Main' ? T.mainChip : T.parChip}`}>
                    {a.activityType}
                  </span>
                  <span className={`font-mono text-sm font-bold tabular-nums flex-shrink-0 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {fmtClock(Date.now() - a.startMs)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S3 + S4 — PIE CHART + BAR CHART (side by side on desktop)     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* S3 — Time Distribution donut */}
          <div className={`${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
            <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Today's Time Distribution</div>
            {pieData.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 gap-2 ${T.textFaint}`}>
                <IcoClock/>
                <span className="text-xs">No completed activities yet today</span>
              </div>
            ) : (
              <>
                <div className="relative" style={{height: 220}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                        dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2}>
                        {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color}/>)}
                      </Pie>
                      <ReTooltip
                        contentStyle={ttStyle}
                        formatter={(v) => [fmtDur(Number(v)), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className={`font-bold text-xl tabular-nums ${T.text}`}>{fmtDur(todayTotalMs)}</div>
                    <div className={`text-[10px] mt-0.5 ${T.textFaint}`}>total</div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {pieData.map(entry => {
                    const pct = todayTotalMs > 0 ? Math.round((entry.value / todayTotalMs) * 100) : 0
                    return (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: entry.color}}/>
                        <span className={`flex-1 truncate ${T.textSub}`}>{entry.name}</span>
                        <span className={`font-mono tabular-nums ${T.text}`}>{fmtDur(entry.value)}</span>
                        <span className={`w-8 text-right tabular-nums ${T.textFaint}`}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* S4 — Timeline bar chart */}
          <div className={`${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
            <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Today's Timeline</div>
            {endedToday.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 gap-2 ${T.textFaint}`}>
                <IcoClock/>
                <span className="text-xs">No completed activities yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timelineData} margin={{top: 4, right: 4, left: -16, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.borderRaw} vertical={false}/>
                  <XAxis
                    dataKey="label"
                    interval={5}
                    tick={{fontSize: 10, fill: T.faintRaw}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{fontSize: 10, fill: T.faintRaw}}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <ReTooltip
                    contentStyle={ttStyle}
                    formatter={(v) => [`${Number(v)} min`, 'Duration']}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar dataKey="minutes" radius={[3, 3, 0, 0]} barSize={8} maxBarSize={20}>
                    {timelineData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S5 — CATEGORY BREAKDOWN TABLE                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
          <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Category Breakdown</div>
          {catRows.length === 0 ? (
            <div className={`text-center py-8 text-xs ${T.textFaint}`}>No activities today</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={T.textFaint}>
                    <th className="text-left pb-3 font-bold tracking-wide w-6 pr-3">#</th>
                    <th className="text-left pb-3 font-bold tracking-wide">Category</th>
                    <th className="text-right pb-3 font-bold tracking-wide cursor-pointer select-none pl-4"
                      onClick={() => handleSort('count')}>
                      Count{sortIndicator('count')}
                    </th>
                    <th className="text-right pb-3 font-bold tracking-wide cursor-pointer select-none pl-4"
                      onClick={() => handleSort('totalMs')}>
                      Total Time{sortIndicator('totalMs')}
                    </th>
                    <th className="text-right pb-3 font-bold tracking-wide cursor-pointer select-none pl-4"
                      onClick={() => handleSort('avgMs')}>
                      Avg{sortIndicator('avgMs')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catRows.map((row, idx) => (
                    <tr key={row.cat} className={`${idx % 2 === 0 ? T.stripeBg : ''} rounded`}>
                      <td className={`py-2.5 pr-3 font-mono ${T.textFaint}`}>{idx + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: row.color}}/>
                          <span className={`font-semibold ${T.text} truncate max-w-[140px]`}>{row.cat}</span>
                        </div>
                      </td>
                      <td className={`py-2.5 pl-4 text-right font-mono tabular-nums ${T.textSub}`}>{row.count}</td>
                      <td className="py-2.5 pl-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`h-1.5 rounded-full flex-1 max-w-[56px] overflow-hidden ${dark ? 'bg-[#2A3340]' : 'bg-gray-200'}`}>
                            <div className="h-full rounded-full transition-all" style={{width: `${row.pct}%`, background: row.color}}/>
                          </div>
                          <span className={`font-mono tabular-nums ${T.text} min-w-[3.5rem] text-right`}>{fmtDur(row.totalMs)}</span>
                        </div>
                      </td>
                      <td className={`py-2.5 pl-4 text-right font-mono tabular-nums ${T.textSub}`}>{row.avgMs > 0 ? fmtDur(row.avgMs) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S6 + S7 — 7-DAY HEATMAP (60%) + RECORDS (40%)                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-5 gap-4">

          {/* S6 — 7-day heatmap */}
          <div className={`md:col-span-3 ${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
            <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Last 7 Days</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {last7.map(day => (
                <div key={day.key}
                  className={`flex-1 min-w-[52px] flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors ${heatCls(day.count, day.isToday)}`}>
                  {day.isToday
                    ? <span className={`text-[9px] font-bold tracking-[0.5px] uppercase ${dark ? 'text-blue-400' : 'text-blue-600'}`}>Today</span>
                    : <span className="text-[9px] opacity-0">·</span>
                  }
                  <span className={`text-[11px] font-bold ${T.textSub}`}>{day.abbr}</span>
                  <span className={`text-xl font-bold ${T.text}`}>{day.num}</span>
                  {day.count > 0
                    ? <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${dark ? 'bg-[#2A3340] text-[#E6EDF3]' : 'bg-white text-gray-700'}`}>{day.count}</span>
                    : <span className={`text-[10px] ${T.textFaint}`}>—</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* S7 — Records & Streaks */}
          <div className={`md:col-span-2 ${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
            <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Records</div>
            <div className="space-y-2.5">
              {([
                {
                  icon: <span className="text-base leading-none">🔥</span>,
                  label: 'Current Streak',
                  value: `${streak} day${streak !== 1 ? 's' : ''}`,
                  accentCls: dark ? 'text-orange-400' : 'text-orange-600',
                  bgCls:     dark ? 'bg-orange-500/10' : 'bg-orange-50',
                },
                {
                  icon: <IcoTrophy/>,
                  label: 'Longest Activity',
                  value: longestEver ? `${fmtDur(longestEver.endMs! - longestEver.startMs)} · ${longestEver.category}` : '—',
                  accentCls: dark ? 'text-yellow-400' : 'text-yellow-600',
                  bgCls:     dark ? 'bg-yellow-500/10' : 'bg-yellow-50',
                },
                {
                  icon: <IcoTag/>,
                  label: 'Top Category',
                  value: mostActiveCat ? `${mostActiveCat[0]} · ${mostActiveCat[1]}×` : '—',
                  accentCls: dark ? 'text-green-400' : 'text-green-600',
                  bgCls:     dark ? 'bg-green-500/10' : 'bg-green-50',
                },
                {
                  icon: <IcoDatabase/>,
                  label: 'All-Time Duration',
                  value: totalTimeAll > 0 ? fmtDur(totalTimeAll) : '—',
                  accentCls: dark ? 'text-purple-400' : 'text-purple-600',
                  bgCls:     dark ? 'bg-purple-500/10' : 'bg-purple-50',
                },
              ] as const).map(r => (
                <div key={r.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.bgCls}`}>
                  <span className={`flex-shrink-0 ${r.accentCls}`}>{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold tracking-[0.5px] uppercase ${T.textFaint}`}>{r.label}</div>
                    <div className={`text-xs font-bold truncate mt-0.5 ${r.accentCls}`}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* S8 — RECENT ACTIVITY FEED                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`${T.surface} border ${T.border} rounded-2xl p-5 ${T.shadow}`}>
          <div className={`text-xs font-bold tracking-[1.5px] uppercase ${T.textFaint} mb-4`}>Recent Activities</div>
          {recentActs.length === 0 ? (
            <div className={`text-center py-8 text-xs ${T.textFaint}`}>No activities logged yet</div>
          ) : (
            <>
              <div>
                {recentActs.map((a, idx) => (
                  <div key={a.id}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl ${idx % 2 === 0 ? T.stripeBg : ''}`}>
                    <span className={`font-mono text-[10px] flex-shrink-0 min-w-[5.5rem] ${T.textFaint}`}>{a.dateKey}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-semibold ${T.text}`}>{a.category}</span>
                      {a.subcategory !== 'No Status' && (
                        <span className={`${T.textSub} ml-1`}>› {a.subcategory}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${a.activityType === 'Main' ? T.mainChip : T.parChip}`}>
                      {a.activityType}
                    </span>
                    <span className={`font-mono flex-shrink-0 min-w-[3.5rem] text-right ${T.textSub}`}>
                      {a.endMs !== null ? fmtDur(a.endMs - a.startMs) : <span className={dark ? 'text-amber-400' : 'text-amber-600'}>live</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-3 pt-3 border-t ${T.border} flex items-center justify-end gap-1 text-xs ${T.textFaint}`}>
                <span>Switch to Log tab to view all</span>
                <IcoChevR/>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
