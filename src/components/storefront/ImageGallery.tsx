import React, { useState, useEffect } from 'react'
import { ProductImage } from '../../api/products'

interface ImageGalleryProps {
  images: ProductImage[]
  selectedColor: string | null
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, selectedColor }) => {
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null)

  // Filter images by color if specified, fallback to all images
  const colorFilteredImages = selectedColor
    ? images.filter((img) => img.color === selectedColor || !img.color)
    : images

  const displayedImages = colorFilteredImages.length > 0 ? colorFilteredImages : images

  useEffect(() => {
    // Default to primary image or the first image available
    const primary = displayedImages.find((img) => img.is_primary) || displayedImages[0]
    setActiveImage(primary || null)
  }, [displayedImages])

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-surface-950 border border-white/[0.06] flex items-center justify-center text-gray-500">
        No mockups available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-surface-950 border border-white/[0.06] shadow-card">
        <img
          src={activeImage?.url || 'https://via.placeholder.com/600'}
          alt={activeImage?.alt_text || 'Product Mockup'}
          className="h-full w-full object-cover object-center transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails Row */}
      {displayedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayedImages.map((img) => {
            const isActive = activeImage?.id === img.id
            return (
              <button
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-950 border transition-all duration-200 ${
                  isActive ? 'border-brand-500 scale-105 shadow-glow-sm' : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || 'Thumbnail'}
                  className="h-full w-full object-cover object-center"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
