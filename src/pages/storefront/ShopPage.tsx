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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Shop the drops</h1>
        <p className="mt-4 text-gray-400 max-w-xl text-sm">Browse clothing drops, hoodies, caps, and statement streetwear items.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="hidden lg:block space-y-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !categorySlug ? 'bg-brand-500/10 text-brand-400 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Drops
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  categorySlug === cat.slug ? 'bg-brand-500/10 text-brand-400 font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mobile Category pills & Search Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Mobile Category pills */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-2">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                  !categorySlug ? 'bg-brand-500/10 border-brand-500 text-brand-300' : 'border-white/[0.08] text-gray-400'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                    categorySlug === cat.slug ? 'bg-brand-500/10 border-brand-500 text-brand-300' : 'border-white/[0.08] text-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-sm md:ml-auto">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search collection items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 w-full py-2.5"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <ProductGrid products={products} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}
