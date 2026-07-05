import React from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import { Product } from '../../api/products'
import { formatCurrency } from '../../lib/utils'

interface ProductsTableProps {
  products: Product[]
  onDelete: (id: string) => void
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, onDelete }) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01] text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Printful Sync Product ID</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No products added yet. Start by browsing the Printful catalog.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={product.thumbnail_url || 'https://via.placeholder.com/60'}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover bg-surface-950 border border-white/[0.06]"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">Slug: {product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {product.printful_sync_product_id ? `#${product.printful_sync_product_id}` : 'Not Synced'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {formatCurrency(product.base_price || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        product.is_active
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-brand-500 hover:border-brand-500 text-gray-400 hover:text-white transition-all duration-200"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          onDelete(product.id)
                        }
                      }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-red-500 hover:border-red-500 text-gray-400 hover:text-white transition-all duration-200"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
