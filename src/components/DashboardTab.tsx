interface Props { userEmail: string; onSignOut: () => void }

export default function DashboardTab({ userEmail: _userEmail }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-3 px-6">
        <div className="text-5xl">📊</div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-gray-500 text-sm">Daily stats and insights coming soon.<br/>Log activities in the Log tab first!</p>
      </div>
    </div>
  )
}
