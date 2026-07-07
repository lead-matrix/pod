import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../../components/storefront/ProductGrid'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { Search } from 'lucide-react'

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')

  const categorySlug = searchParams.get('category') || undefined

  const { data: categories = [] } = useCategories()
  const { data: products = [], isLoading } = useProducts({
    categorySlug,
    search: searchTerm || undefined,
  })

  const handleCategorySelect = (slug: string | null) => {
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  const activeCategory = categories.find(c => c.slug === categorySlug)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

      {/* ── Page header ───────────────────────────────── */}
      <div className="mb-14 border-b border-white/[0.06] pb-10">
        <span className="font-mono-label text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]">
          {activeCategory ? activeCategory.name : 'All Collections'}
        </span>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 leading-none tracking-tight">
          {activeCategory ? activeCategory.name : 'Shop the Drops'}
        </h1>
        <p className="text-gray-600 text-sm mt-4 max-w-xl font-light">
          {activeCategory?.description || 'Browse streetwear drops, capsule exclusives, hoodies, caps and statement pieces.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-4">

        {/* ── Filters sidebar ─────────────────────────── */}
        <aside className="hidden lg:block space-y-8">
          <div>
            <h3 className="font-mono-label text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em] mb-4">
              Categories
            </h3>
            <div className="space-y-0.5">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left px-0 py-2.5 font-mono-label text-xs uppercase tracking-[0.15em] transition-colors border-b border-white/[0.04] ${
                  !categorySlug
                    ? 'text-[#c9a84c] font-semibold'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                All Drops
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left px-0 py-2.5 font-mono-label text-xs uppercase tracking-[0.15em] transition-colors border-b border-white/[0.04] ${
                    categorySlug === cat.slug
                      ? 'text-[#c9a84c] font-semibold'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info callout */}
          <div className="border border-[#c9a84c]/15 p-4 bg-[#c9a84c]/[0.03]">
            <p className="font-mono-label text-[9px] uppercase tracking-[0.15em] text-[#c9a84c] mb-1">Live Runway</p>
            <p className="text-xs text-gray-600 leading-relaxed font-light">
              Hover any product to see our models walk the runway wearing that exact piece.
            </p>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Mobile category pills + search row */}
          <div className="flex flex-col gap-4">
            <div className="flex lg:hidden overflow-x-auto gap-1 pb-1">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex-shrink-0 px-4 py-2 font-mono-label text-[10px] uppercase tracking-[0.15em] border transition-colors ${
                  !categorySlug
                    ? 'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/[0.06]'
                    : 'border-white/[0.08] text-gray-500 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex-shrink-0 px-4 py-2 font-mono-label text-[10px] uppercase tracking-[0.15em] border transition-colors ${
                    categorySlug === cat.slug
                      ? 'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/[0.06]'
                      : 'border-white/[0.08] text-gray-500 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search + count row */}
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono-label text-[10px] text-gray-600 uppercase tracking-[0.15em]">
                {isLoading ? '—' : `${products.length} piece${products.length !== 1 ? 's' : ''}`}
              </span>
              <div className="relative w-56">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-600">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="glass-input pl-9 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Product grid */}
          <ProductGrid products={products} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}
