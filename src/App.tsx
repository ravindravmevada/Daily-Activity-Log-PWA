import { useEffect, useState, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { useAuthStore } from './store/authStore'
import { signInWithGoogle, signOutUser } from './firebase/auth'
import LogTab from './components/LogTab'
import DashboardTab from './components/DashboardTab'
import ConfigTab from './components/ConfigTab'

// ── Error boundary for LogTab ─────────────────────────────────────────────────
class LogErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' }
  static getDerivedStateFromError(e: Error) { return { hasError: true, message: e.message } }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('[LogTab crash]', e, info.componentStack) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#0D1117]">
          <div className="text-4xl select-none">⚠️</div>
          <p className="text-[#E6EDF3] font-bold text-lg">Daily Log encountered an error</p>
          <code className="text-[#8B98A9] text-xs font-mono bg-[#151B23] border border-[#2A3340] px-4 py-2 rounded-xl max-w-md break-all">
            {this.state.message}
          </code>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type Tab = 'dashboard' | 'log' | 'config'

const THEME_KEY   = 'dal-theme'
const SIDEBAR_KEY = 'dal-sidebar'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoGrid = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IcoClock = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcoGear = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IcoSun = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IcoMoon = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IcoSignOut = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcoMenu = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IcoChevronLeft = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IcoX = ({ cls }: { cls: string }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function App() {
  const { user, loading, initialize } = useAuthStore()
  const [activeTab, setActiveTab]           = useState<Tab>('log')
  const [dark, setDark]                     = useState(() => localStorage.getItem(THEME_KEY) !== 'light')
  const [sidebarExpanded, setSidebarExpanded] = useState(() => localStorage.getItem(SIDEBAR_KEY) !== 'collapsed')
  const [mobileOpen, setMobileOpen]         = useState(false)

  useEffect(() => { initialize() }, [])
  useEffect(() => { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { localStorage.setItem(SIDEBAR_KEY, sidebarExpanded ? 'expanded' : 'collapsed') }, [sidebarExpanded])

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <IcoClock cls="w-10 h-10 text-green-400 mx-auto animate-pulse" />
          <p className="text-[#8B98A9] text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center px-6">
        <div className="text-center space-y-8 w-full max-w-sm">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto">
              <IcoClock cls="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Activity Log</h1>
            <p className="text-[#8B98A9] text-sm">Track every moment with precision</p>
          </div>
          <button onClick={signInWithGoogle}
            className="w-full py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: 'dashboard', label: 'Dashboard',
      icon: (active) => <IcoGrid cls={`w-5 h-5 flex-shrink-0 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
    {
      id: 'log', label: 'Daily Log',
      icon: (active) => <IcoClock cls={`w-5 h-5 flex-shrink-0 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
    {
      id: 'config', label: 'Config',
      icon: (active) => <IcoGear cls={`w-5 h-5 flex-shrink-0 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
  ]

  const pageTitles: Record<Tab, string> = { dashboard: 'Dashboard', log: 'Daily Log', config: 'Config' }
  const userInitial = user.email?.[0]?.toUpperCase() ?? '?'
  const toggleDark  = () => setDark(d => !d)

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const sidebarBg    = dark ? 'bg-[#151B23]' : 'bg-white'
  const sidebarBdr   = dark ? 'border-[#2A3340]' : 'border-[#E5E7EB]'
  const navText      = dark ? 'text-[#8B98A9]' : 'text-gray-600'
  const navHover     = dark ? 'hover:bg-[#1B2330] hover:text-[#E6EDF3]' : 'hover:bg-gray-50 hover:text-gray-900'
  const navActiveCls = dark ? 'bg-blue-500/10 text-blue-400 border-l-blue-400' : 'bg-blue-50 text-blue-600 border-l-blue-500'
  const navActiveCollapsed = dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
  const headerBg     = dark ? 'bg-[#151B23] border-[#2A3340]' : 'bg-white border-[#E5E7EB]'
  const headerText   = dark ? 'text-[#E6EDF3]' : 'text-gray-900'
  const avatarCls    = dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
  const themeToggle  = dark ? 'border-[#2A3340] bg-[#1B2330] text-[#8B98A9] hover:text-[#E6EDF3]' : 'border-[#E5E7EB] bg-gray-50 text-gray-500 hover:text-gray-800'
  const iconBtnCls   = dark ? 'text-[#8B98A9] hover:bg-[#1B2330] hover:text-[#E6EDF3]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
  const tooltipCls   = 'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg z-[200] opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150'

  // ── Dynamic sidebar/content width classes ────────────────────────────────────
  const sideWCls    = sidebarExpanded ? 'w-[220px]' : 'w-16'
  const headerMlCls = sidebarExpanded ? 'ml-[220px]' : 'ml-16'
  const contentMlCls = sidebarExpanded ? 'md:ml-[220px]' : 'md:ml-16'

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#0D1117]' : 'bg-[#F4F6F9]'}`}>

      {/* ── MOBILE OVERLAY ───────────────────────────────────────────────────── */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── MOBILE OFF-CANVAS DRAWER ─────────────────────────────────────────── */}
      <div className={`md:hidden fixed left-0 top-0 h-full w-[260px] z-50 flex flex-col border-r transition-transform duration-300 ease-in-out ${sidebarBg} ${sidebarBdr} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Drawer header */}
        <div className={`flex items-center justify-between px-4 h-14 border-b flex-shrink-0 ${sidebarBdr}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-green-400/10 border border-green-400/20' : 'bg-green-50 border border-green-200'}`}>
              <IcoClock cls="w-4 h-4 text-green-500" />
            </div>
            <span className={`text-sm font-bold ${headerText}`}>Activity Log</span>
          </div>
          <button onClick={() => setMobileOpen(false)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${iconBtnCls}`}>
            <IcoX cls="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors border-l-2 ${
                  active ? navActiveCls : `border-l-transparent ${navText} ${navHover}`
                }`}>
                {tab.icon(active)}
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Drawer user + sign out */}
        <div className={`px-3 py-4 border-t flex-shrink-0 ${sidebarBdr}`}>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>{userInitial}</div>
            <span className={`text-xs truncate ${dark ? 'text-[#8B98A9]' : 'text-gray-500'}`}>{user.email}</span>
          </div>
          <button onClick={signOutUser}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${dark ? 'text-[#8B98A9] hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
            <IcoSignOut cls="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full border-r z-30 transition-[width] duration-300 ease-in-out overflow-hidden ${sideWCls} ${sidebarBg} ${sidebarBdr}`}>

        {/* Sidebar header / toggle */}
        <div className={`flex items-center h-14 border-b flex-shrink-0 ${sidebarBdr} ${sidebarExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
          {sidebarExpanded && (
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-green-400/10 border border-green-400/20' : 'bg-green-50 border border-green-200'}`}>
                <IcoClock cls="w-4 h-4 text-green-500" />
              </div>
              <span className={`text-sm font-bold truncate ${headerText}`}>Activity Log</span>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(e => !e)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${iconBtnCls}`}
          >
            {sidebarExpanded ? <IcoChevronLeft cls="w-4 h-4" /> : <IcoMenu cls="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <div key={tab.id} className="relative group/tip">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center py-2.5 rounded-xl text-sm font-semibold transition-colors overflow-hidden ${
                    sidebarExpanded
                      ? `gap-3 px-3 border-l-2 ${active ? navActiveCls : `border-l-transparent ${navText} ${navHover}`}`
                      : `justify-center ${active ? navActiveCollapsed : `${navText} ${navHover}`}`
                  }`}
                >
                  {tab.icon(active)}
                  {sidebarExpanded && <span className="truncate">{tab.label}</span>}
                </button>
                {/* Custom tooltip — only visible when sidebar is collapsed */}
                {!sidebarExpanded && <div className={tooltipCls}>{tab.label}</div>}
              </div>
            )
          })}
        </nav>

        {/* Sidebar user section */}
        <div className={`py-3 border-t flex-shrink-0 ${sidebarBdr} ${sidebarExpanded ? 'px-3' : 'px-2'}`}>
          {sidebarExpanded ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>{userInitial}</div>
                <span className={`text-xs truncate ${dark ? 'text-[#8B98A9]' : 'text-gray-500'}`}>{user.email}</span>
              </div>
              <button onClick={signOutUser}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${dark ? 'text-[#8B98A9] hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
                <IcoSignOut cls="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="relative group/tip">
              <button onClick={signOutUser}
                className={`w-full flex items-center justify-center py-2 rounded-xl transition-colors ${dark ? 'text-[#8B98A9] hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
                <IcoSignOut cls="w-4 h-4" />
              </button>
              <div className={tooltipCls}>Sign Out</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ───────────────────────────────────────────────────── */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-4 gap-3 border-b ${headerBg}`}>
        <button onClick={() => setMobileOpen(true)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${iconBtnCls}`}>
          <IcoMenu cls="w-5 h-5" />
        </button>
        <h1 className={`text-sm font-bold flex-1 ${headerText}`}>{pageTitles[activeTab]}</h1>
        <button onClick={toggleDark}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${themeToggle}`}>
          {dark ? <IcoSun cls="w-4 h-4" /> : <IcoMoon cls="w-4 h-4" />}
        </button>
      </header>

      {/* ── DESKTOP HEADER ───────────────────────────────────────────────────── */}
      <header className={`hidden md:flex items-center justify-between px-6 h-14 border-b sticky top-0 z-20 transition-[margin-left] duration-300 ease-in-out ${headerMlCls} ${headerBg}`}>
        <h1 className={`text-sm font-bold ${headerText}`}>{pageTitles[activeTab]}</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${themeToggle}`}>
            {dark ? <IcoSun cls="w-4 h-4" /> : <IcoMoon cls="w-4 h-4" />}
          </button>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${avatarCls}`}>
            {userInitial}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className={`pt-12 md:pt-0 pb-16 md:pb-0 transition-[margin-left] duration-300 ease-in-out ${contentMlCls}`}>
        {activeTab === 'dashboard' && <DashboardTab userEmail={user.email || ''} onSignOut={signOutUser} dark={dark} onToggleDark={toggleDark} />}
        {activeTab === 'log' && (
          <LogErrorBoundary>
            <LogTab userEmail={user.email || ''} onSignOut={signOutUser} dark={dark} onToggleDark={toggleDark} />
          </LogErrorBoundary>
        )}
        {activeTab === 'config' && <ConfigTab userEmail={user.email || ''} onSignOut={signOutUser} />}
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────────── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 ${dark ? 'bg-[#151B23] border-t border-[#2A3340]' : 'bg-white border-t border-[#E5E7EB]'}`}>
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors">
              {tab.icon(activeTab === tab.id)}
              <span className={`text-xs font-semibold ${activeTab === tab.id ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  )
}

export default App
