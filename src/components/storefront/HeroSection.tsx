import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'

const MARQUEE_ITEMS = [
  'New Season',
  'Capsule Drops',
  'Streetwear',
  'Techwear',
  'Hoodies',
  'Limited Edition',
  'Graphic Tees',
  'Editorial Fits',
  'New Season',
  'Capsule Drops',
  'Streetwear',
  'Techwear',
  'Hoodies',
  'Limited Edition',
  'Graphic Tees',
  'Editorial Fits',
]

// Hero model images — crossfade loop
const HERO_MODELS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=85',
]

export const HeroSection: React.FC = () => {
  const { settings } = useSettingsStore()
  const [currentImg, setCurrentImg] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentImg(prev => (prev + 1) % HERO_MODELS.length)
        setVisible(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* ── Announcement / marquee ticker ──────────────── */}
      <div className="w-full bg-[#080808] border-b border-white/[0.06] overflow-hidden py-2.5">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span
              key={i}
              className="font-mono-label text-[10px] uppercase tracking-[0.2em] text-gray-500 px-6"
            >
              {item}
              <span className="mx-6 text-[#c9a84c]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Main hero ──────────────────────────────────── */}
      <section className="relative min-h-[92vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

        {/* Left — editorial text */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-20 lg:py-28 relative z-10">
          {/* Season badge */}
          <span className="font-mono-label text-[10px] uppercase tracking-[0.25em] text-[#c9a84c] mb-8">
            SS/26 — New Season Collection
          </span>

          {/* Headline — staggered word reveal */}
          <h1
            className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[1.0] text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span
              className="block"
              style={{ animation: 'wordReveal 0.7s cubic-bezier(.16,1,.3,1) 0.1s both' }}
            >
              {settings.heroTitle?.split(' ').slice(0, 2).join(' ') || 'Wear The'}
            </span>
            <span
              className="block text-[#c9a84c]"
              style={{ animation: 'wordReveal 0.7s cubic-bezier(.16,1,.3,1) 0.3s both', fontStyle: 'italic' }}
            >
              {settings.heroTitle?.split(' ').slice(2).join(' ') || 'Difference'}
            </span>
          </h1>

          {/* Subline */}
          <p
            className="mt-8 text-gray-500 text-base leading-relaxed max-w-sm font-light"
            style={{ animation: 'wordReveal 0.7s cubic-bezier(.16,1,.3,1) 0.5s both' }}
          >
            {settings.heroSubtitle || 'Exclusive print-on-demand drops. Each piece designed to make a statement, crafted for the ones who move different.'}
          </p>

          {/* CTAs */}
          <div
            className="mt-12 flex flex-wrap gap-4"
            style={{ animation: 'wordReveal 0.7s cubic-bezier(.16,1,.3,1) 0.65s both' }}
          >
            <Link to="/shop" className="glass-button-primary">
              Shop Collection
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/shop?category=capsule-drops" className="glass-button-secondary">
              Capsule Drops
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mt-16 grid grid-cols-3 gap-8 border-t border-white/[0.06] pt-8 max-w-sm"
            style={{ animation: 'wordReveal 0.7s cubic-bezier(.16,1,.3,1) 0.8s both' }}
          >
            {[
              { num: '9+', label: 'Active Drops' },
              { num: '5', label: 'Categories' },
              { num: '48h', label: 'Ship Time' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-display text-2xl font-semibold text-white">{num}</div>
                <div className="font-mono-label text-[9px] uppercase tracking-[0.18em] text-gray-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — model photo (crossfading) */}
        <div className="relative hidden lg:block overflow-hidden bg-[#0e0e0e]">
          {/* Fade overlay left edge */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />

          {HERO_MODELS.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Campaign model ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
              style={{ opacity: i === currentImg && visible ? 1 : 0 }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* Dot indicators */}
          <div className="absolute bottom-8 right-8 flex gap-2 z-20">
            {HERO_MODELS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'bg-[#c9a84c] w-4' : 'bg-white/25'}`}
                aria-label={`Hero image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile model bg */}
        <div className="lg:hidden absolute inset-0 -z-10">
          <img
            src={HERO_MODELS[currentImg]}
            alt="Campaign model"
            className="w-full h-full object-cover object-top opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/40" />
        </div>
      </section>
    </>
  )
}
