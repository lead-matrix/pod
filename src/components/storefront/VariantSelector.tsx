import React from 'react'
import { ProductVariant } from '../../api/products'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onChange: (variant: ProductVariant) => void
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onChange,
}) => {
  // Group variants by size and color
  const sizes = Array.from(new Set(variants.map((v) => v.size)))
  const colors = Array.from(
    new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color, { name: v.color!, hex: v.color_hex || '#FFFFFF' }])
    ).values()
  )

  const handleSizeSelect = (size: string) => {
    // Find the first variant matching this size, ideally keeping the current color if possible
    const currentColor = selectedVariant?.color
    let match = variants.find((v) => v.size === size && v.color === currentColor)
    if (!match) {
      match = variants.find((v) => v.size === size)
    }
    if (match) onChange(match)
  }

  const handleColorSelect = (colorName: string) => {
    // Find the first variant matching this color, ideally keeping the current size if possible
    const currentSize = selectedVariant?.size
    let match = variants.find((v) => v.color === colorName && v.size === currentSize)
    if (!match) {
      match = variants.find((v) => v.color === colorName)
    }
    if (match) onChange(match)
  }

  return (
    <div className="space-y-6">
      {/* Color Select */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Color</h3>
          <div className="flex items-center gap-3">
            {colors.map((color) => {
              const isSelected = selectedVariant?.color === color.name
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                    isSelected ? 'border-brand-500 scale-110 shadow-glow-sm' : 'border-white/[0.12] hover:border-white/30'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                  {isSelected && (
                    <span className="absolute h-2.5 w-2.5 rounded-full bg-white mix-blend-difference" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Select */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size
              const isAvailable = variants.some((v) => v.size === size && v.in_stock)

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl border text-sm font-medium px-4 transition-all duration-150 ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-glow-sm'
                      : isAvailable
                      ? 'border-white/[0.08] text-white bg-white/[0.02] hover:border-white/20'
                      : 'border-white/[0.04] text-gray-600 bg-white/[0.01] cursor-not-allowed line-through'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
