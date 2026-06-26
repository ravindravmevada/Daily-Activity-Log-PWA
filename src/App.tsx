import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import { signInWithGoogle, signOutUser } from './firebase/auth'
import LogTab from './components/LogTab'
import DashboardTab from './components/DashboardTab'
import ConfigTab from './components/ConfigTab'

type Tab = 'dashboard' | 'log' | 'config'

const THEME_KEY = 'dal-theme'

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

function App() {
  const { user, loading, initialize } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('log')
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light')

  useEffect(() => { initialize() }, [])
  useEffect(() => { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') }, [dark])

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
      icon: (active) => <IcoGrid cls={`w-5 h-5 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
    {
      id: 'log', label: 'Daily Log',
      icon: (active) => <IcoClock cls={`w-5 h-5 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
    {
      id: 'config', label: 'Config',
      icon: (active) => <IcoGear cls={`w-5 h-5 ${active ? (dark ? 'text-blue-400' : 'text-blue-500') : (dark ? 'text-[#5C6878]' : 'text-gray-400')}`} />,
    },
  ]

  const pageTitles: Record<Tab, string> = { dashboard: 'Dashboard', log: 'Daily Log', config: 'Config' }
  const userInitial = user.email?.[0]?.toUpperCase() ?? '?'
  const toggleDark = () => setDark(d => !d)

  // ── sidebar / header theme tokens
  const sidebarBg   = dark ? 'bg-[#151B23]' : 'bg-white'
  const sidebarBdr  = dark ? 'border-[#2A3340]' : 'border-[#E5E7EB]'
  const navText     = dark ? 'text-[#8B98A9]' : 'text-gray-600'
  const navHover    = dark ? 'hover:bg-[#1B2330] hover:text-[#E6EDF3]' : 'hover:bg-gray-50 hover:text-gray-900'
  const navActiveCls = dark
    ? 'bg-blue-500/10 text-blue-400 border-l-blue-400'
    : 'bg-blue-50 text-blue-600 border-l-blue-500'
  const headerBg    = dark ? 'bg-[#151B23] border-[#2A3340]' : 'bg-white border-[#E5E7EB]'
  const headerText  = dark ? 'text-[#E6EDF3]' : 'text-gray-900'
  const avatarCls   = dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
  const themeToggle = dark ? 'border-[#2A3340] bg-[#1B2330] text-[#8B98A9] hover:text-[#E6EDF3]' : 'border-[#E5E7EB] bg-gray-50 text-gray-500 hover:text-gray-800'

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#0D1117]' : 'bg-[#F4F6F9]'}`}>

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] border-r z-30 ${sidebarBg} ${sidebarBdr}`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${sidebarBdr}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-green-400/10 border border-green-400/20' : 'bg-green-50 border border-green-200'}`}>
            <IcoClock cls="w-4 h-4 text-green-500" />
          </div>
          <span className={`text-sm font-bold ${headerText}`}>Activity Log</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors border-l-2 ${
                  active ? navActiveCls : `border-l-transparent ${navText} ${navHover}`
                }`}>
                {tab.icon(active)}
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* User + sign out */}
        <div className={`px-3 py-4 border-t ${sidebarBdr}`}>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>
              {userInitial}
            </div>
            <span className={`text-xs truncate ${dark ? 'text-[#8B98A9]' : 'text-gray-500'}`}>{user.email}</span>
          </div>
          <button onClick={signOutUser}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${dark ? 'text-[#8B98A9] hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
            <IcoSignOut cls="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── DESKTOP HEADER ─────────────────────────────────────────────────── */}
      <header className={`hidden md:flex items-center justify-between px-6 h-14 border-b sticky top-0 z-20 ml-[220px] ${headerBg}`}>
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

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="md:ml-[220px]">
        <div className="pb-16 md:pb-0">
          {activeTab === 'dashboard' && <DashboardTab userEmail={user.email || ''} onSignOut={signOutUser} />}
          {activeTab === 'log' && <LogTab userEmail={user.email || ''} onSignOut={signOutUser} dark={dark} onToggleDark={toggleDark} />}
          {activeTab === 'config' && <ConfigTab userEmail={user.email || ''} onSignOut={signOutUser} />}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────────── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 safe-area-pb ${dark ? 'bg-[#151B23] border-t border-[#2A3340]' : 'bg-white border-t border-[#E5E7EB]'}`}>
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
