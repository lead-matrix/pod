import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, CreditCard, Loader2, ArrowRight } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'
import { ordersApi } from '../../api/orders'

export const CartPage: React.FC = () => {
  const { items, subtotal, shipping, total, updateQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const [checkingOut, setCheckingOut] = useState(false)

  const handleCheckout = async () => {
    try {
      setCheckingOut(true)
      const successUrl = `${window.location.origin}/checkout-success`
      const cancelUrl = `${window.location.origin}/cart`

      const payload = {
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          product_name: item.product_name,
          variant_size: item.variant_size,
          variant_color: item.variant_color,
          unit_price: item.unit_price,
          image_url: item.image_url,
          printful_variant_id: item.printful_variant_id,
          printful_sync_variant_id: item.printful_sync_variant_id,
          sku: item.sku,
        })),
        customer_email: user?.email || '',
        customer_name: user?.user_metadata?.full_name || 'Guest Customer',
        user_id: user?.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }

      const { url } = await ordersApi.createCheckoutSession(payload)
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err instanceof Error ? err.message : 'Checkout redirection failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-bold text-white mt-4 tracking-tight">Your shopping bag is empty</h2>
        <p className="text-gray-400 mt-2 text-sm">Add items from the store drops to get started.</p>
        <Link to="/shop" className="glass-button-primary mt-8 inline-flex items-center gap-2">
          Start shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variant_id}
              className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={item.image_url}
                alt={item.product_name}
                className="h-24 w-24 rounded-xl object-cover object-center bg-surface-950 border border-white/[0.06] flex-shrink-0"
              />
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between w-full">
                <div className="text-center sm:text-left">
                  <Link to={`/product/${item.product_slug}`}>
                    <h3 className="text-base font-bold text-white tracking-tight hover:text-brand-300 transition-colors">
                      {item.product_name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">
                    Size: {item.variant_size} {item.variant_color && `| Color: ${item.variant_color}`}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  {/* Quantity adjustment */}
                  <div className="flex items-center rounded-lg bg-surface-950 border border-white/[0.08] px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                      className="p-1.5 text-gray-400 hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold px-3 text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      className="p-1.5 text-gray-400 hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Price info */}
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.variant_id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Pricing Summary Panel */}
        <div className="glass-card p-6 h-fit space-y-6">
          <h3 className="text-base font-bold text-white tracking-tight">Order Summary</h3>

          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-white">
                {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
              </span>
            </div>
            <div className="border-t border-white/[0.06] pt-3 flex justify-between text-base font-bold text-white">
              <span>Total</span>
              <span className="text-brand-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full flex items-center justify-center gap-2 bg-brand-gradient hover:opacity-95 text-white font-semibold py-3.5 rounded-xl shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {checkingOut ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-500 leading-normal">
            Upon payment confirmation, your order will be submitted automatically to Printful for production & fulfillment.
          </p>
        </div>
      </div>
    </div>
  )
}
