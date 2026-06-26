import { create } from 'zustand'

export interface LocalActivity {
  id: string
  startMs: number
  endMs: number | null
  category: string
  subcategory: string
  activityDoneAt: string
  activityType: 'Main' | 'Parallel'
  hasStartTimestamp: boolean
  hasNotes: boolean
  notes: string
  loggedFrom: string
  loggedVia: string
  groupId: string | null
  activityNumber: number
  subIndex: number | null
  notesStatus?: 'undecided' | 'none' | 'has-notes'
}

export type DayData = Record<string, LocalActivity[]>

interface ActivityState {
  days: DayData
  setDays: (days: DayData) => void
  addActivity: (date: string, act: LocalActivity) => void
  endActivity: (date: string, id: string, updates: Partial<LocalActivity>) => void
  updateActivity: (date: string, id: string, updates: Partial<LocalActivity>) => void
  groupActivities: (date: string, ids: string[]) => void
  deleteActivity: (date: string, id: string) => void
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

export const useActivityStore = create<ActivityState>((set, get) => ({
  days: {},

  setDays: (days) => set({ days }),

  addActivity: (date, act) => {
    set(prev => ({
      days: { ...prev.days, [date]: [...(prev.days[date] || []), act] }
    }))
  },

  endActivity: (date, id, updates) => {
    set(prev => ({
      days: {
        ...prev.days,
        [date]: (prev.days[date] || []).map(a =>
          a.id === id ? { ...a, ...updates, endMs: Date.now() } : a
        )
      }
    }))
  },

  updateActivity: (date, id, updates) => {
    set(prev => ({
      days: {
        ...prev.days,
        [date]: (prev.days[date] || []).map(a =>
          a.id === id ? { ...a, ...updates } : a
        )
      }
    }))
  },

  groupActivities: (date, ids) => {
    const acts = get().days[date] || []
    const toGroup = acts.filter(a => ids.includes(a.id))
    if (toGroup.length < 2) return

    // use lowest activityNumber as group number
    const groupNum = Math.min(...toGroup.map(a => a.activityNumber))
    const groupId = uid()

    // sort by startMs to assign subIndex
    const sorted = [...toGroup].sort((a, b) => a.startMs - b.startMs)

    set(prev => ({
      days: {
        ...prev.days,
        [date]: (prev.days[date] || []).map(a => {
          const idx = sorted.findIndex(s => s.id === a.id)
          if (idx === -1) return a
          return { ...a, groupId, activityNumber: groupNum, subIndex: idx + 1 }
        })
      }
    }))
  },

  deleteActivity: (date, id) => {
    set(prev => ({
      days: {
        ...prev.days,
        [date]: (prev.days[date] || []).filter(a => a.id !== id)
      }
    }))
  },
}))
