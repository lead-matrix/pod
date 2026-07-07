import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Product } from '../../api/products'
import { formatCurrency } from '../../lib/utils'

// ── Model walk frames per garment type ─────────────────────────────────────
// 4 editorial fashion-model photos per category — crossfades to simulate walk
const RUNWAY_FRAMES: Record<string, string[]> = {
  hoodies: [
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
  ],
  tees: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&auto=format&fit=crop&q=80',
  ],
  caps: [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  ],
  techwear: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
  ],
  'capsule-drops': [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  ],
}
const DEFAULT_FRAMES = RUNWAY_FRAMES['tees']

function getFrames(product: Product): string[] {
  const slug = product.category?.slug ?? ''
  return RUNWAY_FRAMES[slug] ?? DEFAULT_FRAMES
}

function salePercent(product: Product): number | null {
  const variant = product.product_variants?.[0]
  if (!variant?.compare_at_price || !variant.retail_price) return null
  const pct = Math.round((1 - variant.retail_price / variant.compare_at_price) * 100)
  return pct > 0 ? pct : null
}

function isLowStock(product: Product): boolean {
  const total = product.product_variants?.reduce((s, v) => s + (v.stock_level ?? 0), 0) ?? 0
  return total > 0 && total <= 8
}

function isCapsule(product: Product): boolean {
  return product.category?.slug === 'capsule-drops' ||
    (product.tags ?? []).includes('capsule')
}

// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [hovered, setHovered] = useState(false)
  const frames = getFrames(product)
  const sale = salePercent(product)
  const lowStock = isLowStock(product)
  const capsule = isCapsule(product)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass-card group flex flex-col h-full overflow-hidden"
    >
      {/* ── Image / Runway ──────────────────────────────── */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: '3/4' }}
        aria-label={`View ${product.name}`}
      >
        {/* Static product thumbnail (always rendered for SEO/LCP) */}
        <img
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${hovered ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />

        {/* Live model walk frames (4 images crossfading) */}
        {hovered && (
          <div className="runway-reveal absolute inset-0">
            {frames.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.name} on model — frame ${i + 1}`}
                className="model-walk-frame"
                loading="lazy"
              />
            ))}
            {/* Walk overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {capsule && <span className="badge-capsule">Capsule</span>}
          {sale && <span className="badge-sale">−{sale}%</span>}
          {lowStock && <span className="badge-low-stock">Last units</span>}
        </div>

        {/* Hover CTA — bottom */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <span className="flex items-center gap-2 text-white font-mono-label text-xs font-semibold uppercase tracking-widest">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
            Live runway — Shop now
            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
          </span>
        </div>
      </Link>

      {/* ── Product Info ─────────────────────────────────── */}
      <div className="flex-1 p-5 flex flex-col justify-between border-t border-white/[0.05]">
        <div>
          <span className="font-mono-label text-[10px] font-medium uppercase tracking-[0.15em] text-[#c9a84c]">
            {product.category?.name ?? 'Streetwear'}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-display text-[1.05rem] font-semibold text-white tracking-tight mt-1 leading-snug line-clamp-1 group-hover:text-[#c9a84c] transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-5 pt-4 border-t border-white/[0.04]">
          <div>
            <span className="text-xl font-semibold text-white font-display">
              {formatCurrency(product.product_variants?.[0]?.retail_price ?? product.base_price ?? 0)}
            </span>
            {sale && (
              <span className="ml-2 text-xs text-gray-600 line-through font-mono-label">
                {formatCurrency(product.product_variants?.[0]?.compare_at_price ?? 0)}
              </span>
            )}
          </div>
          <Link
            to={`/product/${product.slug}`}
            className="font-mono-label text-[10px] uppercase tracking-widest text-[#c9a84c] border-b border-[#c9a84c]/40 hover:border-[#c9a84c] pb-0.5 transition-all duration-200"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  )
}
