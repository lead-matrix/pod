import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Truck, RefreshCw } from 'lucide-react'
import { useOrderById, useUpdateOrderStatus, useResubmitOrderToPrintful } from '../../hooks/useOrders'
import { formatCurrency } from '../../lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrderById(id || '')
  const updateStatusMutation = useUpdateOrderStatus()
  const resubmitMutation = useResubmitOrderToPrintful()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Order not found.</p>
        <Link to="/admin/orders" className="text-brand-400 hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    )
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as typeof order.status
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: nextStatus,
        internalNotes: `Status manually updated to ${nextStatus}`,
      })
      toast.success('Order status updated.')
    } catch (err) {
      toast.error('Failed to update order status.')
    }
  }

  const handleResubmit = async () => {
    try {
      await resubmitMutation.mutateAsync(order.id)
      toast.success('Order submitted to Printful successfully!')
    } catch (err) {
      toast.error('Fulfillment submission failed.')
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header action panel */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Order {order.order_number}</h1>
            <p className="text-gray-400 text-sm mt-1">Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
        </div>

        {/* Resubmit button if not sent to Printful */}
        {!order.printful_order_id && (
          <button
            onClick={handleResubmit}
            disabled={resubmitMutation.isPending}
            className="flex items-center gap-2 bg-accent-500/10 border border-accent-500/30 hover:bg-accent-500 hover:text-white text-accent-400 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            {resubmitMutation.isPending ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4.5 w-4.5" />
            )}
            Resubmit to Printful
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Line items details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Line Items</h3>
            <div className="divide-y divide-white/[0.04] space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80'}
                    alt={item.product_name}
                    className="h-16 w-16 rounded-lg object-cover bg-surface-950 border border-white/[0.06] flex-shrink-0"
                  />
                  <div className="flex-1 flex justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.product_name}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-semibold">
                        Size: {item.variant_size} {item.variant_color && `| Color: ${item.variant_color}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white block">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </span>
                      <span className="text-xs text-gray-400">
                        Total: {formatCurrency(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdowns */}
          <div className="glass-card p-6 space-y-3 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Cost</span>
              <span className="font-semibold text-white">{formatCurrency(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-semibold text-white">{formatCurrency(order.tax)}</span>
            </div>
            <div className="border-t border-white/[0.06] pt-3 flex justify-between text-base font-bold text-white">
              <span>Total Cost</span>
              <span className="text-brand-400">{formatCurrency(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        {/* Right column: Status settings, shipping addresses */}
        <div className="space-y-6">
          {/* Status edit panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Order Status</h3>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400">Fulfillment Status</label>
              <select
                value={order.status}
                onChange={handleStatusChange}
                className="w-full glass-input"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Printful status check */}
          <div className="glass-card p-6 space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Printful Sync</h3>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-semibold uppercase">Fulfillment ID</span>
              <span className="text-white font-mono">{order.printful_order_id ? `#${order.printful_order_id}` : 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-semibold uppercase">Status Details</span>
              <span className="glow-badge text-[9px]">{order.printful_status || 'Unsubmitted'}</span>
            </div>
          </div>

          {/* Customer details */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Customer Info</h3>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white">{order.customer_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.customer_email}</p>
              {order.shipping_phone && <p className="text-xs text-gray-400 mt-1">{order.shipping_phone}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-brand-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="font-semibold text-white">{order.shipping_name}</p>
              <p>{order.shipping_address1}</p>
              {order.shipping_address2 && <p>{order.shipping_address2}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
              </p>
              <p className="uppercase text-xs font-semibold text-gray-500 mt-1">{order.shipping_country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
