import { useState } from 'react'
import { CATEGORIES, ACTIVITY_DONE_AT, ACTIVITY_LOGGED_FROM, ACTIVITY_LOGGED_VIA } from '../types/categories'
import type { Activity } from '../types/activity'

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).replace(',', ' -').replace(',', ' -')
}

const getTodayDate = (): string => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

interface Props {
  onSubmit: (activity: Partial<Activity>) => void
  onCancel: () => void
}

export default function AddActivityForm({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState('No Status')
  const [subcategory, setSubcategory] = useState('No Status')
  const [activityDoneAt, setActivityDoneAt] = useState('No Status')
  const [hasStartTimestamp, setHasStartTimestamp] = useState(false)
  const [startTimestamp, setStartTimestamp] = useState<Date | null>(null)
  const [hasEndTimestamp, setHasEndTimestamp] = useState(false)
  const [endTimestamp, setEndTimestamp] = useState<Date | null>(null)
  const [activityType, setActivityType] = useState<'Main' | 'Parallel'>('Main')
  const [hasNotes, setHasNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [loggedFrom, setLoggedFrom] = useState('Daily Activity Log Web App (PWA)')
  const [loggedVia, setLoggedVia] = useState('Daily Activity Log Web App (PWA)')

  const subcategories = CATEGORIES[category] || ['No Status']

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setSubcategory('No Status')
  }

  const handleSubmit = () => {
    onSubmit({
      date: getTodayDate(),
      category,
      subcategory,
      activityType,
      hasStartTimestamp,
      startTimestamp: hasStartTimestamp ? startTimestamp : null,
      hasEndTimestamp,
      endTimestamp: hasEndTimestamp ? endTimestamp : null,
      hasNotes,
      notes: hasNotes ? notes : '',
      syncedToSheet: false,
    })
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-5 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white">Log New Activity</h2>

      {/* Category */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Category</label>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {Object.keys(CATEGORIES).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Subcategory</label>
        <select
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {subcategories.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Activity Done At */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Activity Done At</label>
        <select
          value={activityDoneAt}
          onChange={(e) => setActivityDoneAt(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {ACTIVITY_DONE_AT.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Activity Type */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Activity Type</label>
        <div className="flex gap-3">
          {['Main', 'Parallel'].map(type => (
            <button
              key={type}
              onClick={() => setActivityType(type as 'Main' | 'Parallel')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                activityType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Has Start Timestamp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Has Start Timestamp</label>
          <button
            onClick={() => {
              setHasStartTimestamp(!hasStartTimestamp)
              if (!hasStartTimestamp) setStartTimestamp(new Date())
              else setStartTimestamp(null)
            }}
            className={`w-12 h-6 rounded-full transition-colors ${
              hasStartTimestamp ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${
              hasStartTimestamp ? 'translate-x-3' : '-translate-x-3'
            }`} />
          </button>
        </div>
        {hasStartTimestamp && startTimestamp && (
          <div className="bg-gray-800 rounded-lg px-4 py-2.5 text-sm text-blue-400">
            {formatTimestamp(startTimestamp)}
            <button
              onClick={() => setStartTimestamp(new Date())}
              className="ml-3 text-xs text-gray-500 hover:text-white"
            >
              Now
            </button>
          </div>
        )}
      </div>

      {/* Has End Timestamp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Has End Timestamp</label>
          <button
            onClick={() => {
              setHasEndTimestamp(!hasEndTimestamp)
              if (!hasEndTimestamp) setEndTimestamp(new Date())
              else setEndTimestamp(null)
            }}
            className={`w-12 h-6 rounded-full transition-colors ${
              hasEndTimestamp ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${
              hasEndTimestamp ? 'translate-x-3' : '-translate-x-3'
            }`} />
          </button>
        </div>
        {hasEndTimestamp && endTimestamp && (
          <div className="bg-gray-800 rounded-lg px-4 py-2.5 text-sm text-blue-400">
            {formatTimestamp(endTimestamp)}
            <button
              onClick={() => setEndTimestamp(new Date())}
              className="ml-3 text-xs text-gray-500 hover:text-white"
            >
              Now
            </button>
          </div>
        )}
      </div>

      {/* Has Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Has Notes</label>
          <button
            onClick={() => setHasNotes(!hasNotes)}
            className={`w-12 h-6 rounded-full transition-colors ${
              hasNotes ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${
              hasNotes ? 'translate-x-3' : '-translate-x-3'
            }`} />
          </button>
        </div>
        {hasNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes..."
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
          />
        )}
      </div>

      {/* Logged From */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Activity Logged From</label>
        <select
          value={loggedFrom}
          onChange={(e) => setLoggedFrom(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {ACTIVITY_LOGGED_FROM.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Logged Via */}
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Activity Logged Via</label>
        <select
          value={loggedVia}
          onChange={(e) => setLoggedVia(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        >
          {ACTIVITY_LOGGED_VIA.map(via => (
            <option key={via} value={via}>{via}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Log Activity
        </button>
      </div>
    </div>
  )
}