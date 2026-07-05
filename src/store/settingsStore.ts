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
  storeName: 'ThreadDrop',
  supportEmail: 'support@threaddrop.com',
  announcements: [
    '💥 DROP 001 IS NOW LIVE — LIMIT QUANTITIES',
    '✈️ FREE WORLDWIDE SHIPPING ON ORDERS OVER $75',
    '⚡ GET 15% OFF YOUR FIRST ORDER USING CODE: WELCOME15'
  ],
  maintenanceMode: false,
  tiktokUrl: 'https://tiktok.com/@threaddrop',
  instagramUrl: 'https://instagram.com/@threaddrop',
  youtubeUrl: 'https://youtube.com/@threaddrop',
  heroTitle: 'RARE APPAREL FOR RARE SOULS',
  heroSubtitle: 'Limited drops. Automatic print-on-demand fulfillment. Built to stand out.',
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
