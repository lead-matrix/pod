import React from 'react'
import { Check, Truck, CreditCard, Box, Ban } from 'lucide-react'

interface OrderStatusProps {
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const steps = [
    { key: 'paid', label: 'Payment confirmed', icon: CreditCard },
    { key: 'processing', label: 'In production (Printful)', icon: Box },
    { key: 'shipped', label: 'Shipped out', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check },
  ]

  const getStatusIndex = () => {
    switch (status) {
      case 'pending': return -1
      case 'paid': return 0
      case 'processing':
      case 'fulfilled': return 1
      case 'shipped': return 2
      case 'delivered': return 3
      default: return -1
    }
  }

  const currentIndex = getStatusIndex()

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        <Ban className="h-5 w-5" />
        <span className="text-sm font-semibold">This order has been cancelled.</span>
      </div>
    )
  }

  if (status === 'refunded') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
        <Ban className="h-5 w-5" />
        <span className="text-sm font-semibold">This order has been refunded.</span>
      </div>
    )
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-center max-w-xl mx-auto">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/[0.06] -translate-y-1/2 z-0" />
        {/* Highlighted Progress Line */}
        {currentIndex > 0 && (
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        )}

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex
          const isActive = idx === currentIndex
          const StepIcon = step.icon

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm scale-110'
                    : 'bg-surface-900 border-white/[0.08] text-gray-500'
                } ${isActive ? 'ring-4 ring-brand-500/20 scale-115' : ''}`}
              >
                <StepIcon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-3 whitespace-nowrap hidden sm:block ${
                isCompleted ? 'text-white' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
