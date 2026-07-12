import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreSettings {
  storeName: string
  supportEmail: string
  announcements: string[]
  maintenanceMode: boolean
  tiktokUrl: string
  instagramUrl: string
  youtubeUrl: string
  heroTitle: string
  heroSubtitle: string
}

interface SettingsState {
  settings: StoreSettings
  updateSettings: (updates: Partial<StoreSettings>) => void
}

const defaultSettings: StoreSettings = {
  storeName: 'LMTRX',
  supportEmail: 'og@lmtrx.us',
  announcements: [
    '◆ COLLECTION 01 IS NOW LIVE — EXTREMELY LIMITED QUANTITIES',
    '◆ COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150',
    '◆ LOG IN FOR EXCLUSIVE MEMBER CAPSULES'
  ],
  maintenanceMode: false,
  tiktokUrl: 'https://tiktok.com/@lmtrx',
  instagramUrl: 'https://instagram.com/@lmtrx',
  youtubeUrl: 'https://youtube.com/@lmtrx',
  heroTitle: 'WEAR THE DIFFERENCE',
  heroSubtitle: 'Hand-crafted premium drops. Dynamic human model presentations. Engineered for high-fashion liveness.',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
    }),
    {
      name: 'thread-drop-settings',
    }
  )
)
