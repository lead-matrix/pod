import React, { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Settings,
  FolderOpen,
  ArrowLeft,
  Shield,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, initialized } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (initialized && (!user || !isAdmin)) {
      navigate('/login')
    }
  }, [user, isAdmin, initialized, navigate])

  if (loading || !initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#06060a]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Store Products', path: '/admin/products', icon: Layers },
    { name: 'Printful Catalog', path: '/admin/catalog', icon: FolderOpen },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen w-screen bg-[#07070c] text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.06] bg-[#09090f]">
        <div className="flex h-16 items-center px-6 border-b border-white/[0.06]">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-white">
            <Shield className="h-5 w-5 text-brand-400" />
            <span>ThreadDrop Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-white/[0.06] bg-[#09090f]">
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/admin" className="font-bold text-white flex items-center gap-1.5">
              <Shield className="h-5 w-5 text-brand-400" />
              <span>Admin</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-gray-400 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
              Role: Admin
            </span>
          </div>
        </header>

        {/* Mobile Navigation Footer (sticky bottom on mobile) */}
        <nav className="md:hidden flex items-center justify-around h-16 border-t border-white/[0.06] bg-[#09090f] order-last">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-brand-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1">{item.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </nav>

        {/* Main scrollable page panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#07070c]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
