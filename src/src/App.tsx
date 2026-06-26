import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import { signInWithGoogle, signOutUser } from './firebase/auth'
import LogTab from './components/LogTab'
import DashboardTab from './components/DashboardTab'
import ConfigTab from './components/ConfigTab'

type Tab = 'dashboard' | 'log' | 'config'

function App() {
  const { user, loading, initialize } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('log')

  useEffect(() => { initialize() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <svg className="w-10 h-10 text-green-400 mx-auto animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
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
              <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Activity Log</h1>
            <p className="text-[#8B98A9] text-sm">Track every moment with precision</p>
          </div>
          <button onClick={signInWithGoogle}
            className="w-full py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'dashboard' as Tab, label: 'Dashboard',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-[#5C6878]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      id: 'log' as Tab, label: 'Log',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-[#5C6878]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    {
      id: 'config' as Tab, label: 'Config',
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-[#5C6878]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="pb-16">
        {activeTab === 'dashboard' && <DashboardTab userEmail={user.email||''} onSignOut={signOutUser} />}
        {activeTab === 'log' && <LogTab userEmail={user.email||''} onSignOut={signOutUser} />}
        {activeTab === 'config' && <ConfigTab userEmail={user.email||''} onSignOut={signOutUser} />}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#151B23] border-t border-[#2A3340] z-30 safe-area-pb">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors">
              {tab.icon(activeTab === tab.id)}
              <span className={`text-xs font-semibold ${activeTab === tab.id ? 'text-blue-400' : 'text-[#5C6878]'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
