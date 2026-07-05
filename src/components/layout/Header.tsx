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
  const { settings } = useSettingsStore()
  
  // Rotating announcements index logic
  const [currentAnnIdx, setCurrentAnnIdx] = useState(0)

  useEffect(() => {
    if (!settings.announcements || settings.announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrentAnnIdx((prev) => (prev + 1) % settings.announcements.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [settings.announcements])

  const hasAnnouncements = settings.announcements && settings.announcements.length > 0

  return (
    <>
      {/* Dynamic Announcement Bar */}
      {hasAnnouncements && (
        <div className="w-full bg-brand-gradient py-1.5 px-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white shadow-glow-sm relative z-50">
          <div className="transition-all duration-500 ease-in-out">
            {settings.announcements[currentAnnIdx]}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#06060a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="bg-brand-gradient bg-clip-text text-transparent">{settings.storeName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
              <Link to="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
            </nav>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4">
            {/* Admin Badge */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-400 text-xs font-semibold px-3 py-1 uppercase tracking-wider"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}

            {/* Account Icon */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 hover:text-white transition-all duration-200">
                  <UserIcon className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-white/[0.08] bg-surface-900 p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150">
                  <Link to="/account" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.05] rounded-lg transition-colors">My Profile</Link>
                  {isAdmin && <Link to="/admin" className="block md:hidden px-4 py-2 text-sm text-accent-400 hover:bg-white/[0.05] rounded-lg transition-colors">Admin Panel</Link>}
                  <button
                    onClick={() => signOut().then(() => navigate('/'))}
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 hover:text-white transition-all duration-200"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 hover:text-white transition-all duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-glow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden border-b border-white/[0.06] bg-[#06060a] px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-300 hover:bg-white/[0.05] hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-300 hover:bg-white/[0.05] hover:text-white"
            >
              Shop
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-accent-400 hover:bg-white/[0.05]"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
