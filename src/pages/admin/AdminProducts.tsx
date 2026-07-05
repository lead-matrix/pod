import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2 } from 'lucide-react'
import { ProductsTable } from '../../components/admin/ProductsTable'
import { useAdminProducts, useDeleteProduct } from '../../hooks/useProducts'
import toast from 'react-hot-toast'

export const AdminProducts: React.FC = () => {
  const { data: products = [], isLoading } = useAdminProducts()
  const deleteMutation = useDeleteProduct()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Product deleted successfully.')
    } catch (err) {
      toast.error('Failed to delete product.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Products</h1>
          <p className="text-gray-400 text-sm mt-1">Manage synced print-on-demand items listed on your site.</p>
        </div>
        <Link
          to="/admin/catalog"
          className="glass-button-primary flex items-center gap-2"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Product
        </Link>
      </div>

      {/* Products Table Panel */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <ProductsTable products={products} onDelete={handleDelete} />
      )}
    </div>
  )
}
