import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Search, AlertCircle } from 'lucide-react'
import { Order } from '../../api/orders'
import { formatCurrency } from '../../lib/utils'
import { format } from 'date-fns'

interface OrdersTableProps {
  orders: Order[]
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
      paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
      processing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      fulfilled: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
      shipped: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      delivered: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
      refunded: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    }
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${badges[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Search */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input pl-10 w-full py-2.5"
        />
      </div>

      {/* Orders Grid/Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Order Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Fulfillment ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {order.printful_order_id ? `#${order.printful_order_id}` : (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Unfulfilled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-brand-500 hover:border-brand-500 text-gray-400 hover:text-white transition-all duration-200"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
