import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUserOrders } from '../../hooks/useOrders'
import { formatCurrency } from '../../lib/utils'
import { format } from 'date-fns'
import { Loader2, User, ShoppingBag, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const AccountPage: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { data: orders = [], isLoading } = useUserOrders()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut().then(() => navigate('/'))
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
      paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
      processing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      fulfilled: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
      shipped: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      delivered: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
    }
    return (
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badges[status] || ''}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Page Title / Welcomer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Account dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Hello, {profile?.full_name || user?.email}. Manage your orders and profile.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-semibold px-4 py-2 rounded-xl transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="glass-card p-6 h-fit space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Profile Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 block text-xs font-semibold">Name</span>
              <span className="text-white font-medium">{profile?.full_name || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs font-semibold">Email address</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>
            {profile?.phone && (
              <div>
                <span className="text-gray-500 block text-xs font-semibold">Phone number</span>
                <span className="text-white font-medium">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order History Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Order History</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-6 text-center text-gray-500 text-sm">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.01] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Order Number</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-gray-300">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.01]">
                        <td className="px-6 py-4 font-semibold text-white font-mono">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
