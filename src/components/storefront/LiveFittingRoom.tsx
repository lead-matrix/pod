import React, { useState } from 'react'
import { X, Camera, Sparkles, Check, Trash2, ArrowRight } from 'lucide-react'
import { Product } from '../../api/products'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

// Curated set of default high-fashion avatar models representing different body types
const FITTING_MODELS = [
  { id: 'm-slim', name: 'Alexander (Male Slim)', height: "6'2\"", img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80' },
  { id: 'f-curvy', name: 'Elena (Female Curvy)', height: "5'9\"", img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80' },
  { id: 'm-athletic', name: 'Marcus (Male Athletic)', height: "6'1\"", img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80' },
  { id: 'f-sporty', name: 'Sienna (Female Athletic)', height: "5'10\"", img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80' }
]

interface LiveFittingRoomProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
}

export const LiveFittingRoom: React.FC<LiveFittingRoomProps> = ({ isOpen, onClose, products }) => {
  const { addItem } = useCart()
  const [selectedModel, setSelectedModel] = useState(FITTING_MODELS[0])
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  
  // Active try-on clothing selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null)
  const [selectedColor, setSelectedColor] = useState('Pitch Black')
  const [selectedSize, setSelectedSize] = useState('M')

  // Fitting room overlays positioning offsets (so chest overlays match chest locations)
  const [overlayScale, setOverlayScale] = useState(100)
  const [overlayYOffset, setOverlayYOffset] = useState(30)
  const [overlayXOffset, setOverlayXOffset] = useState(0)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhoto(event.target.result as string)
          toast.success('Successfully uploaded photo to Live Mirror!')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTryOnAdd = () => {
    if (!selectedProduct) return

    const selectedVariant = selectedProduct.product_variants?.[0]

    addItem({
      variant_id: selectedVariant?.id || `tryon-${selectedProduct.id}`,
      quantity: 1,
      product_name: selectedProduct.name,
      variant_size: selectedSize,
      variant_color: selectedColor,
      unit_price: Number(selectedProduct.base_price || 45),
      image_url: selectedProduct.thumbnail_url || '',
      printful_variant_id: selectedVariant?.printful_variant_id || 4001,
      printful_sync_variant_id: selectedVariant?.printful_sync_variant_id || null,
      sku: selectedVariant?.sku || 'TRY-ON',
      product_slug: selectedProduct.slug
    })

    toast.success(`${selectedProduct.name} added to cart!`)
    onClose()
  }

  if (!isOpen) return null

  // Calculate live fit index score dynamically based on selections
  const calculateFitScore = () => {
    if (!selectedProduct) return 0
    let base = 85
    if (selectedSize === 'M' || selectedSize === 'L') base += 8
    if (selectedModel.id.startsWith('m') && selectedProduct.category?.name === 'Hoodies') base += 5
    return Math.min(99, base)
  }

  const fitScore = calculateFitScore()

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-neutral-950 border-l border-white/10 shadow-glow flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">3D Live Dressing Mirror</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Fitting Space */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Model Avatar / Self-Photo Toggle Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Fit Model</label>
            <label className="relative cursor-pointer text-xs font-bold text-brand-400 hover:underline flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              <span>Upload Self Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {FITTING_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model)
                  setUploadedPhoto(null)
                }}
                className={`relative rounded-xl overflow-hidden border aspect-[3/4] transition-all flex flex-col ${
                  !uploadedPhoto && selectedModel.id === model.id 
                    ? 'border-brand-500 ring-2 ring-brand-500/30 scale-95 shadow-glow-sm' 
                    : 'border-white/[0.05] hover:border-white/20'
                }`}
              >
                <img src={model.img} alt={model.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] text-center text-white truncate">
                  {model.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>

          {uploadedPhoto && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
              <span className="text-brand-300 font-semibold">Using custom uploaded mirror photo</span>
              <button 
                onClick={() => setUploadedPhoto(null)} 
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live Try-On Fitting Mirror Screen */}
        <div className="relative aspect-[3/4] w-full rounded-2xl border border-white/[0.06] bg-black overflow-hidden flex items-center justify-center shadow-inner group">
          {/* Base Image Layer (Avatar or User Photo) */}
          <img 
            src={uploadedPhoto || selectedModel.img} 
            alt="Base Avatar" 
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
          />

          {/* Interactive Clothing overlay mask */}
          {selectedProduct && (
            <div 
              className="absolute w-[45%] pointer-events-none select-none transition-all duration-300 flex items-center justify-center"
              style={{
                top: `${overlayYOffset}%`,
                left: `${50 - (overlayScale / 2) + overlayXOffset}%`,
                width: `${overlayScale * 0.45}%`,
                opacity: 0.9,
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.45))'
              }}
            >
              {/* Wear product thumbnail */}
              <img 
                src={selectedProduct.thumbnail_url || 'https://via.placeholder.com/400'} 
                alt="Try-on Clothing" 
                className="w-full h-auto mix-blend-normal contrast-105 brightness-105"
              />
            </div>
          )}

          {/* Fit score display card */}
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/75 backdrop-blur-md border border-white/[0.06] p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Live Fit Index</span>
              <span className="text-lg font-black text-brand-400">{fitScore}% Match</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Stylist Opinion</span>
              <span className="text-xs font-semibold text-white">
                {fitScore >= 95 ? '🔥 Fits Incredible' : fitScore >= 90 ? '✨ Looks Sleek' : '👍 Fits Comfortably'}
              </span>
            </div>
          </div>

          {/* Placement manual offsets widget (shows on hover) */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/60 border border-white/10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Adjust Fit Alignment</span>
            <div className="flex gap-2 items-center text-[10px] text-gray-400">
              <span>Scale:</span>
              <input 
                type="range" min="80" max="120" value={overlayScale} 
                onChange={(e) => setOverlayScale(Number(e.target.value))} 
                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
            <div className="flex gap-2 items-center text-[10px] text-gray-400">
              <span>Height:</span>
              <input 
                type="range" min="10" max="60" value={overlayYOffset} 
                onChange={(e) => setOverlayYOffset(Number(e.target.value))} 
                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Product Catalog selector inside mirror */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Clothing Item</label>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {products.map((prod) => (
              <button
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`flex-shrink-0 w-36 rounded-xl border p-2 bg-white/[0.01] text-left transition-all ${
                  selectedProduct?.id === prod.id ? 'border-brand-500 bg-brand-500/5' : 'border-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                  <img src={prod.thumbnail_url || 'https://via.placeholder.com/400'} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                <p className="text-[10px] text-brand-400 font-extrabold mt-1">${prod.base_price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Apparel color/size options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color Choice</span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full py-2.5 px-3 rounded-lg bg-surface-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
            >
              <option value="Pitch Black">Pitch Black</option>
              <option value="Eggshell White">Eggshell White</option>
              <option value="Crimson Red">Crimson Red</option>
              <option value="Olive Green">Olive Green</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Size</span>
            <div className="flex gap-1">
              {['S', 'M', 'L', 'XL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedSize === sz 
                      ? 'border-brand-400 bg-brand-500/5 text-brand-300' 
                      : 'border-white/[0.05] bg-white/[0.01] text-gray-400 hover:border-white/10'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Try-on Add to Cart Trigger */}
      <div className="p-6 border-t border-white/10 bg-neutral-950 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Estimated Cost</span>
          <span className="text-xl font-black text-white">${selectedProduct?.base_price || 45}</span>
        </div>
        <button
          onClick={handleTryOnAdd}
          disabled={!selectedProduct}
          className="px-8 py-3.5 rounded-xl font-bold bg-brand-gradient hover:shadow-glow text-white text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
        >
          <span>Purchase This Fit</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
