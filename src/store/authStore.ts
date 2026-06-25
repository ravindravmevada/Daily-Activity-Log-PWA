import { create } from 'zustand'
import { type User } from 'firebase/auth'
import { onAuthChange } from '../firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    onAuthChange((user) => {
      set({ user, loading: false, initialized: true })
    })
  },
}))