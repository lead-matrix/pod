import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User as UserIcon, Menu, X, Shield } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { CartDrawer } from '../storefront/CartDrawer'
import { useSettingsStore } from '../../store/settingsStore'

export const Header: React.FC = () => {
  const { cartCount } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { settings } = useSettingsStore()

  // Announcement rotation
  const [currentAnnIdx, setCurrentAnnIdx] = useState(0)
  useEffect(() => {
    if (!settings.announcements || settings.announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrentAnnIdx(prev => (prev + 1) % settings.announcements.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [settings.announcements])

  // Scroll-shadow on header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const hasAnnouncements = settings.announcements && settings.announcements.length > 0

  return (
    <>
      {/* ── Announcement bar ────────────────────────────── */}
      {hasAnnouncements && (
        <div className="w-full bg-[#c9a84c] py-2 px-4 text-center">
          <p className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.2em] text-[#080808] transition-all duration-500">
            {settings.announcements[currentAnnIdx]}
          </p>
        </div>
      )}

      {/* ── Main header ─────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/[0.08] bg-[#080808]/95 backdrop-blur-lg'
            : 'border-white/[0.04] bg-[#080808]/70 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo / Brand name */}
          <Link
            to="/"
            className="font-display text-xl font-bold text-white tracking-tight hover:text-[#c9a84c] transition-colors duration-200"
          >
            {settings.storeName}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { to: '/',                       label: 'Home' },
              { to: '/shop',                   label: 'Collections' },
              { to: '/shop?category=capsule-drops', label: 'Capsule Drops' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-mono-label text-[11px] uppercase tracking-[0.18em] text-gray-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">

            {/* Admin badge */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 border border-[#c9a84c]/30 text-[#c9a84c] font-mono-label text-[10px] font-semibold px-3 py-1.5 uppercase tracking-wider hover:border-[#c9a84c]/60 transition-colors"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
            )}

            {/* Account */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center justify-center h-9 w-9 border border-white/[0.08] hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200 bg-transparent">
                  <UserIcon className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 origin-top-right border border-white/[0.08] bg-[#0e0e0e] p-2 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150">
                  <Link to="/account" className="block px-4 py-2.5 font-mono-label text-xs text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors uppercase tracking-wider">
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block md:hidden px-4 py-2.5 font-mono-label text-xs text-[#c9a84c] hover:bg-white/[0.04] transition-colors uppercase tracking-wider">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut().then(() => navigate('/'))}
                    className="w-full text-left px-4 py-2.5 font-mono-label text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center h-9 w-9 border border-white/[0.08] hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
              >
                <UserIcon className="h-4 w-4" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center h-9 w-9 border border-white/[0.08] hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-[#c9a84c] text-[9px] font-bold text-[#080808] font-mono-label">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 border border-white/[0.08] text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#080808] px-6 py-5 space-y-1">
            {[
              { to: '/',                            label: 'Home' },
              { to: '/shop',                        label: 'Collections' },
              { to: '/shop?category=capsule-drops', label: 'Capsule Drops' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className="block py-3 font-mono-label text-xs uppercase tracking-[0.18em] text-gray-400 hover:text-white border-b border-white/[0.04] transition-colors"
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block py-3 font-mono-label text-xs uppercase tracking-[0.18em] text-[#c9a84c] transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
