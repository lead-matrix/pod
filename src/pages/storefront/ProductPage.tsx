import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Truck, RotateCcw, ShieldCheck, Loader2 } from 'lucide-react'
import { useProductBySlug } from '../../hooks/useProducts'
import { useCart } from '../../hooks/useCart'
import { ImageGallery } from '../../components/storefront/ImageGallery'
import { VariantSelector } from '../../components/storefront/VariantSelector'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'
import { ProductVariant } from '../../api/products'

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, error } = useProductBySlug(slug || '')
  const { addItem } = useCart()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Default to the first in-stock variant
  useEffect(() => {
    if (product?.product_variants?.length) {
      const firstInStock = product.product_variants.find((v) => v.in_stock)
      setSelectedVariant(firstInStock || product.product_variants[0])
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-gray-400">Product drop not found or expired.</p>
        <Link to="/shop" className="text-brand-400 hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addItem({
      variant_id: selectedVariant.id,
      quantity,
      product_name: product.name,
      variant_size: selectedVariant.size,
      variant_color: selectedVariant.color || '',
      unit_price: Number(selectedVariant.retail_price),
      image_url: selectedVariant.image_url || product.thumbnail_url || '',
      printful_variant_id: selectedVariant.printful_variant_id,
      printful_sync_variant_id: selectedVariant.printful_sync_variant_id,
      sku: selectedVariant.sku || '',
      product_slug: product.slug,
    })

    toast.success(`${product.name} added to cart!`)
  }

  const hasVariants = product.product_variants && product.product_variants.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
        {/* Left: Product Images */}
        <ImageGallery
          images={product.product_images || []}
          selectedColor={selectedVariant?.color || null}
        />

        {/* Right: Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="glow-badge">
              {product.category?.name || 'Streetwear'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-2xl font-extrabold text-brand-400">
              {formatCurrency(Number(selectedVariant?.retail_price ?? product.base_price ?? 0))}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>
          </div>

          {/* Variant Selector */}
          {hasVariants && (
            <VariantSelector
              variants={product.product_variants || []}
              selectedVariant={selectedVariant}
              onChange={setSelectedVariant}
            />
          )}

          {/* Urgency & Social Proof Widget */}
          {selectedVariant && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
              {/* Dynamic Viewer Counter */}
              <div className="flex items-center gap-2 text-xs text-brand-300 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <span>
                  🔥 {Math.floor(Math.random() * 18) + 12} people are viewing this product right now
                </span>
              </div>

              {/* Scarcity Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-500 font-semibold">⚡ Limited Stock Drop:</span>
                <span className="text-gray-400">
                  Only a few items left in size <span className="text-white font-bold">{selectedVariant.size}</span>
                </span>
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-4">
              {/* Quantity selectors */}
              <div className="flex items-center rounded-xl bg-surface-950 border border-white/[0.08] px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  -
                </button>
                <span className="text-sm font-semibold px-4 text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.in_stock}
                className="flex-1 glass-button-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                {selectedVariant?.in_stock ? 'Add to bag' : 'Out of stock'}
              </button>
            </div>
          </div>

          {/* Shipping / Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/[0.06] text-xs text-gray-400">
            <div className="flex items-center gap-2.5">
              <Truck className="h-5 w-5 text-brand-400" />
              <div>
                <p className="font-semibold text-white">Global shipping</p>
                <p className="text-[10px]">Tracking code provided</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-5 w-5 text-brand-400" />
              <div>
                <p className="font-semibold text-white">Returns & Refunds</p>
                <p className="text-[10px]">30-day window policy</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-brand-400" />
              <div>
                <p className="font-semibold text-white">Automatic fulfillment</p>
                <p className="text-[10px]">Directly by Printful</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
