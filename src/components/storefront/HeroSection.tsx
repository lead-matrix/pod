import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export const HeroSection: React.FC = () => {
  const { settings } = useSettingsStore()

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-semibold uppercase tracking-wider text-brand-300 mb-6">
          ✨ New Season Dropped
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-none">
          {settings.heroTitle}
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          {settings.heroSubtitle}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="glass-button-primary flex items-center gap-2"
          >
            Explore products
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="glass-button-secondary"
          >
            How it works
          </Link>
        </div>
      </div>
    </section>
  )
}
