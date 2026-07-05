import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CatalogBrowser } from '../../components/admin/CatalogBrowser'

export const AdminCatalog: React.FC = () => {
  const navigate = useNavigate()

  const handleSelectProduct = (productId: number) => {
    navigate(`/admin/products/create?catalog_id=${productId}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Printful Catalog</h1>
        <p className="text-gray-400 text-sm mt-1">Select a base streetwear apparel from Printful to upload your designs.</p>
      </div>

      {/* Catalog Grid selector */}
      <CatalogBrowser onSelectProduct={handleSelectProduct} />
    </div>
  )
}
