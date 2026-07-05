import React, { useState } from 'react'
import { X, Trash2, Plus, Minus, CreditCard, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'
import { ordersApi } from '../../api/orders'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ translateX: '100%' }}
            animate={{ translateX: 0 }}
            exit={{ translateX: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-md bg-surface-900 border-l border-white/[0.06] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white tracking-tight">Shopping Bag</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {items.length > 0 && (
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">
                    {subtotal >= 75 ? (
                      <span className="text-emerald-400 font-bold">🎉 Free Shipping Unlocked!</span>
                    ) : (
                      <>
                        Add <span className="text-brand-400 font-bold">{formatCurrency(75 - subtotal)}</span> more for Free Shipping
                      </>
                    )}
                  </span>
                  <span className="text-gray-400">{Math.min(100, Math.round((subtotal / 75) * 100))}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-950 rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <span className="text-4xl mb-4">🛒</span>
                  <p className="text-sm font-medium">Your shopping bag is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variant_id}
                    className="flex gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-20 w-20 rounded-lg object-cover object-center bg-surface-950 border border-white/[0.06]"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white line-clamp-1">{item.product_name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Size: {item.variant_size} {item.variant_color && `| Color: ${item.variant_color}`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity adjuster */}
                        <div className="flex items-center rounded-lg bg-surface-950 border border-white/[0.08] px-1 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-semibold px-2.5 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.variant_id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pricing Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.06] bg-surface-950/80 p-6 space-y-4">
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-white">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-base font-bold text-white">
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
                      Checkout now
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-500">
                  Secured by Stripe Checkout. Orders fulfilled automatically.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
