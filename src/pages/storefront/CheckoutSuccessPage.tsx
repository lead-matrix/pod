import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Clipboard } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useOrderById } from '../../hooks/useOrders'

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  const orderId = searchParams.get('order_id') || ''
  const { data: order } = useOrderById(orderId)

  // Clear local cart once landed
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
      <div className="flex justify-center text-green-400">
        <CheckCircle2 className="h-16 w-16 animate-pulse" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-none">
        Thank you for your order!
      </h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        Your payment was processed successfully. We've sent a receipt to your email, and your order is already sent to production.
      </p>

      {order && (
        <div className="glass-card p-6 text-left max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-gray-400">Order Number</span>
            <span className="text-white flex items-center gap-1.5 font-mono">
              {order.order_number}
              <Clipboard className="h-3.5 w-3.5 opacity-60 hover:opacity-100 cursor-pointer" />
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-semibold border-t border-white/[0.04] pt-3">
            <span className="text-gray-400">Fulfillment Status</span>
            <span className="glow-badge text-[10px]">
              {order.status}
            </span>
          </div>
        </div>
      )}

      <div className="pt-8">
        <Link to="/shop" className="glass-button-primary inline-flex items-center gap-2">
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
