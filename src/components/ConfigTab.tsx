interface Props { userEmail: string; onSignOut: () => void }

export default function ConfigTab({ userEmail, onSignOut }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Config</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Signed in as</p>
            <p className="text-sm text-white mt-1">{userEmail}</p>
          </div>
          <button onClick={onSignOut} className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-xl border border-red-600/30 text-sm">
            Sign Out
          </button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-3">Coming Soon</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Manage categories & subcategories</li>
            <li>• Sync settings with Google Sheets</li>
            <li>• Export data</li>
            <li>• Notification preferences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
