import React, { useState } from 'react'
import { Ticket, Percent, Plus, Trash2, Calendar, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  percent_off: number
  amount_off: number | null
  duration: 'once' | 'repeating' | 'forever'
  active: boolean
  max_redemptions: number | null
  times_redeemed: number
}

export const AdminMarketing: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'coupon-1',
      code: 'WELCOME15',
      percent_off: 15,
      amount_off: null,
      duration: 'forever',
      active: true,
      max_redemptions: 500,
      times_redeemed: 114,
    },
    {
      id: 'coupon-2',
      code: 'DROP001',
      percent_off: 20,
      amount_off: null,
      duration: 'once',
      active: true,
      max_redemptions: 100,
      times_redeemed: 82,
    },
    {
      id: 'coupon-3',
      code: 'FREESHIP',
      percent_off: 100,
      amount_off: null,
      duration: 'once',
      active: false,
      max_redemptions: 10,
      times_redeemed: 10,
    },
  ])

  const [code, setCode] = useState('')
  const [percentOff, setPercentOff] = useState(15)
  const [maxRedemptions, setMaxRedemptions] = useState(100)

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: code.trim().toUpperCase(),
      percent_off: percentOff,
      amount_off: null,
      duration: 'forever',
      active: true,
      max_redemptions: maxRedemptions || null,
      times_redeemed: 0,
    }

    setCoupons([newCoupon, ...coupons])
    setCode('')
    toast.success(`Coupon ${newCoupon.code} created! Set up coupon in your Stripe Dashboard to activate it at checkout.`)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    setCoupons(coupons.filter((c) => c.id !== id))
    toast.success('Coupon removed from local view.')
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Ticket className="h-8 w-8 text-brand-400" />
          Marketing & Coupons
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure customer promotion codes and track campaign redemptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="glass-card p-6 h-fit space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <Plus className="h-5 w-5 text-brand-400" />
            <h2>Create Promo Code</h2>
          </div>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="glass-input w-full text-sm font-mono uppercase"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Discount Percent (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={percentOff}
                onChange={(e) => setPercentOff(Number(e.target.value))}
                className="glass-input w-full text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Max Redemptions Limit</label>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                className="glass-input w-full text-sm"
              />
            </div>
            <button
              type="submit"
              className="glass-button-primary w-full flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Check className="h-4 w-4" />
              Generate Code
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-white font-bold">Active Promotion Codes</h2>
              <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full font-semibold">
                Stripe Sync Enabled
              </span>
            </div>

            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                      <Percent className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm tracking-wider">
                          {coupon.code}
                        </span>
                        {!coupon.active && (
                          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {coupon.percent_off}% off • duration: {coupon.duration} • Limit:{' '}
                        {coupon.max_redemptions || 'unlimited'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-semibold block">Redemptions</span>
                      <span className="text-sm font-bold text-white mt-0.5 block">
                        {coupon.times_redeemed}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1.5 hover:bg-white/[0.04] rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
