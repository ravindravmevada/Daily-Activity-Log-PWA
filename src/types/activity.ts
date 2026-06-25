export interface Activity {
  id?: string
  date: string
  activityNumber: number
  subNumber?: string
  category: string
  subcategory: string
  activityType: 'Main' | 'Parallel'
  isGrouped: boolean
  groupId?: string
  hasStartTimestamp: boolean
  startTimestamp?: Date | null
  hasEndTimestamp: boolean
  endTimestamp?: Date | null
  status: 'Yes' | 'No'
  hasNotes: boolean
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  syncedToSheet: boolean
}

export interface DailyLog {
  date: string
  activities: Activity[]
}