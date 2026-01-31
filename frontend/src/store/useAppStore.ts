import { create } from 'zustand'

interface Sensor {
  id: string
  location: { x: number; y: number }
  temperature: number
  vibration: number
  rpm: number
  load: number
  accident_probability?: number
  risk_class?: string
  risk_confidence?: number
  timestamp: string
}

interface AppState {
  sensors: Sensor[]
  darkMode: boolean
  layoutDensity: 'comfortable' | 'compact'
  showNotifications: boolean
  setSensors: (sensors: Sensor[]) => void
  toggleDarkMode: () => void
  setLayoutDensity: (density: 'comfortable' | 'compact') => void
  setShowNotifications: (show: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sensors: [],
  darkMode: localStorage.getItem('darkMode') === 'true',
  layoutDensity: (localStorage.getItem('layoutDensity') as 'comfortable' | 'compact') || 'comfortable',
  showNotifications: true,
  setSensors: (sensors) => set({ sensors }),
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    return { darkMode: newDarkMode };
  }),
  setLayoutDensity: (density) => {
    localStorage.setItem('layoutDensity', density);
    set({ layoutDensity: density });
  },
  setShowNotifications: (show) => set({ showNotifications: show }),
}))

