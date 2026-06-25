import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { signInWithGoogle, signOutUser } from './firebase/auth'

function App() {
  const { user, loading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-blue-400">Daily Activity Log</h1>
          <p className="text-gray-400">Sign in to access your activity log</p>
          <button
            onClick={signInWithGoogle}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">Daily Activity Log</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button
            onClick={signOutUser}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-gray-300">Welcome, {user.displayName}! 👋</p>
        <p className="text-gray-500 text-sm mt-2">Your activity log is ready to be built.</p>
      </main>
    </div>
  )
}

export default App