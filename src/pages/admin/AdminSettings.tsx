import React, { useState } from 'react'
import { WebhookStatus } from '../../components/admin/WebhookStatus'
import { useSettingsStore } from '../../store/settingsStore'
import { Save, Plus, Trash2, Globe, ShieldAlert, Monitor, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore()
  const [storeName, setStoreName] = useState(settings.storeName)
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail)
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || '')
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '')
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '')
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle)
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle)
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode)
  const [announcements, setAnnouncements] = useState<string[]>(settings.announcements)
  const [newAnnouncement, setNewAnnouncement] = useState('')

  const handleSave = () => {
    updateSettings({
      storeName,
      supportEmail,
      tiktokUrl,
      instagramUrl,
      youtubeUrl,
      heroTitle,
      heroSubtitle,
      maintenanceMode,
      announcements,
    })
    toast.success('Store config updated successfully!')
  }

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return
    setAnnouncements([...announcements, newAnnouncement.trim()])
    setNewAnnouncement('')
  }

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index))
  }

  const hasStripe = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const hasPrintful = true

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Store Configuration</h1>
          <p className="text-gray-400 text-sm mt-1">Configure layout, announcement bars, socials, and integrations.</p>
        </div>
        <button
          onClick={handleSave}
          className="glass-button-primary flex items-center gap-2 text-sm"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 1. General Profile */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <Globe className="h-5 w-5 text-brand-400" />
            <h2>General Branding & Info</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero Presentation Settings */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <Sparkles className="h-5 w-5 text-brand-400" />
            <h2>Hero Landing Copy Layout</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Hero Main Headline</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Hero Subtitle</label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={2}
                className="glass-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. Rotating Announcement Banner */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <Monitor className="h-5 w-5 text-brand-400" />
            <h2>Rotating Announcement Bar Banner</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter alert text (e.g. Free shipping on orders over $75!)"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="glass-input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={addAnnouncement}
                className="glass-button-primary flex items-center justify-center p-3"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {announcements.map((ann, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-sm text-gray-300"
                >
                  <span>{ann}</span>
                  <button
                    type="button"
                    onClick={() => removeAnnouncement(idx)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <Globe className="h-5 w-5 text-brand-400" />
            <h2>Social Media Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">TikTok URL</label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">YouTube URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* 5. System Status / Webhooks */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <ShieldAlert className="h-5 w-5 text-brand-400" />
            <h2>System Status & Safety Toggles</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <div>
              <h3 className="text-sm font-semibold text-white">Maintenance Mode / Store Kill Switch</h3>
              <p className="text-xs text-gray-400 mt-0.5">Toggle to lock down the storefront with a maintenance page.</p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                maintenanceMode
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}
            >
              {maintenanceMode ? 'Active' : 'Disabled'}
            </button>
          </div>
          <WebhookStatus stripeConfigured={hasStripe} printfulConfigured={hasPrintful} />
        </div>
      </div>
    </div>
  )
}
