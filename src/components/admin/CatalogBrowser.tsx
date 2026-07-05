import React, { useState } from 'react'
import { FolderOpen, ArrowRight, Loader2, Search } from 'lucide-react'
import { usePrintfulCatalog } from '../../hooks/usePrintful'

interface CatalogBrowserProps {
  onSelectProduct: (productId: number) => void
}

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({ onSelectProduct }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading, error } = usePrintfulCatalog(selectedCategoryId)

  const categories = [
    { id: 1, name: 'T-Shirts' },
    { id: 2, name: 'Hoodies' },
    { id: 3, name: 'Sweatshirts' },
    { id: 4, name: 'Hats' },
    { id: 11, name: 'Bags' },
  ]

  const catalogItems = data?.result || []
  const filteredItems = catalogItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 ${
              selectedCategoryId === undefined
                ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-glow-sm'
                : 'border-white/[0.08] text-gray-400 hover:text-white bg-white/[0.01]'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 ${
                selectedCategoryId === cat.id
                  ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-glow-sm'
                  : 'border-white/[0.08] text-gray-400 hover:text-white bg-white/[0.01]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search catalog items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10 w-full py-2"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium">Fetching catalog products from Printful...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          <p>Failed to retrieve Printful catalog. Ensure your proxy function is running and API keys are set.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image */}
              <div className="aspect-square bg-surface-950 flex items-center justify-center p-6 border-b border-white/[0.04]">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Button */}
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    {item.type}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-1 line-clamp-2">
                    {item.name}
                  </h4>
                </div>
                <button
                  onClick={() => onSelectProduct(item.id)}
                  className="w-full flex items-center justify-center gap-2 mt-6 bg-white/[0.03] border border-white/[0.08] hover:bg-brand-500 hover:border-brand-500 text-white font-medium py-2 rounded-xl transition-all duration-200"
                >
                  Start Designing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
