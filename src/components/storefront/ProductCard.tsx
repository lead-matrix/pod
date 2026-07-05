import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Product } from '../../api/products'
import { formatCurrency } from '../../lib/utils'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden group">
      {/* Product Image Panel */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-surface-950">
        <img
          src={product.thumbnail_url || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-brand-gradient text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-glow-sm">
            Featured
          </span>
        )}
      </Link>

      {/* Product details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
            {product.category?.name || 'Streetwear'}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-base font-bold text-white tracking-tight mt-1 line-clamp-1 hover:text-brand-300 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
          <span className="text-lg font-extrabold text-white">
            {formatCurrency(product.base_price || 0)}
          </span>
          <Link
            to={`/product/${product.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-brand-500 hover:border-brand-500 hover:text-white text-gray-400 transition-all duration-200"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
