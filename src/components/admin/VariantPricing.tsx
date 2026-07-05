import React from 'react'
import { formatCurrency } from '../../lib/utils'

interface PrintfulVariant {
  id: number
  product_id: number
  name: string
  size: string
  color: string
  color_code: string
  color_code2: string
  image: string
  price: string
  in_stock: boolean
}

interface VariantPricingProps {
  variants: PrintfulVariant[]
  selectedVariantIds: number[]
  onChangeSelection: (ids: number[]) => void
  pricingMap: Record<number, { retail_price: number; compare_at_price?: number }>
  onChangePricing: (variantId: number, field: 'retail_price' | 'compare_at_price', value: number) => void
}

export const VariantPricing: React.FC<VariantPricingProps> = ({
  variants,
  selectedVariantIds,
  onChangeSelection,
  pricingMap,
  onChangePricing,
}) => {
  const toggleSelect = (id: number) => {
    if (selectedVariantIds.includes(id)) {
      onChangeSelection(selectedVariantIds.filter((vid) => vid !== id))
    } else {
      onChangeSelection([...selectedVariantIds, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedVariantIds.length === variants.length) {
      onChangeSelection([])
    } else {
      onChangeSelection(variants.map((v) => v.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Select Variants & Pricing</h3>
        <button
          type="button"
          onClick={toggleSelectAll}
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
        >
          {selectedVariantIds.length === variants.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3 w-12 text-center">Active</th>
                <th className="px-4 py-3">Variant Details</th>
                <th className="px-4 py-3">Cost (Printful)</th>
                <th className="px-4 py-3">Retail Price ($)</th>
                <th className="px-4 py-3">Compare Price ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {variants.map((v) => {
                const isSelected = selectedVariantIds.includes(v.id)
                const pricing = pricingMap[v.id] || { retail_price: Math.round(parseFloat(v.price) * 1.5) }

                return (
                  <tr key={v.id} className={`hover:bg-white/[0.01] transition-colors ${isSelected ? 'bg-brand-500/5' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(v.id)}
                        className="rounded border-white/[0.08] bg-surface-950 text-brand-500 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {v.color_code && (
                          <span
                            className="h-4 w-4 rounded-full border border-white/[0.12]"
                            style={{ backgroundColor: v.color_code }}
                          />
                        )}
                        <div>
                          <p className="text-white font-medium text-xs">{v.name}</p>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase">
                            Size: {v.size} {v.color && `| Color: ${v.color}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-400">
                      {formatCurrency(v.price)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        disabled={!isSelected}
                        value={pricing.retail_price}
                        onChange={(e) => onChangePricing(v.id, 'retail_price', parseFloat(e.target.value) || 0)}
                        className="w-20 glass-input px-2 py-1 text-xs text-center"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        disabled={!isSelected}
                        value={pricing.compare_at_price || ''}
                        placeholder="None"
                        onChange={(e) => onChangePricing(v.id, 'compare_at_price', parseFloat(e.target.value) || 0)}
                        className="w-20 glass-input px-2 py-1 text-xs text-center"
                        step="0.01"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
