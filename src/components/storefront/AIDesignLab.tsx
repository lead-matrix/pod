import React, { useState, useEffect } from 'react'
import { Sparkles, ShoppingBag, Sliders, RefreshCw, X, ChevronRight, Check } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

// Curated high-fidelity streetwear template designs representing different styles
const STYLE_TEMPLATES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tags: ['Neo-Tokyo', 'Glowing Pink', 'Mech-Cyber', 'Kanji Details'],
    prompt: 'A futuristic cybernetic samurai helmet surrounded by glowing neon pink and cyan interface lines, detailed digital sketch, synthwave style.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    designOverlay: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80'
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave Sunset',
    tags: ['90s Aesthetic', 'Palm Trees', 'Glitch Sunset', 'Grid Grid'],
    prompt: 'Vaporwave style marble statue wearing sunglasses with retro grid lines and palm trees, sunset pastel purple gradient sky, 90s aesthetic.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    designOverlay: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
  },
  {
    id: 'grunge',
    name: 'Y2K Dark Metal',
    tags: ['Heavy Metal', 'Tribal Spikes', 'Silver Chrome', 'Rebel Core'],
    prompt: 'Chrome tribal spikes heart symbol with y2k aesthetic, gothic calligraphy letters, dark liquid metallic design, isolated on clean black background.',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    designOverlay: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80'
  },
  {
    id: 'techwear',
    name: 'Techwear Vector',
    tags: ['Minimalist Grid', 'Geometric Lines', 'Tactical Alpha', 'Subtle Orange'],
    prompt: 'Minimalist techwear logo, tactical layout coordinates, geometric vector lines with bold orange details, industrial styling scheme.',
    imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80',
    designOverlay: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80'
  }
]

const GARMENTS = [
  { id: 'tee', name: 'Premium Oversized Tee', price: 39, baseMockup: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
  { id: 'hoodie', name: 'Luxury Heavyweight Hoodie', price: 69, baseMockup: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' },
  { id: 'sweatshirt', name: 'Classic Crew Sweatshirt', price: 59, baseMockup: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' }
]

const COLORS = [
  { name: 'Pitch Black', value: '#080808', class: 'bg-neutral-900 border-white/25' },
  { name: 'Eggshell White', value: '#f4f4f0', class: 'bg-neutral-100 border-neutral-300' },
  { name: 'Crimson Red', value: '#5f1818', class: 'bg-red-950 border-white/10' },
  { name: 'Olive Green', value: '#2d3319', class: 'bg-emerald-950 border-white/10' },
  { name: 'Acid Gray', value: '#242526', class: 'bg-zinc-800 border-white/10' }
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

interface AIDesignLabProps {
  isOpen: boolean
  onClose: () => void
  onSelectDesign?: (designUrl: string) => void
}

export const AIDesignLab: React.FC<AIDesignLabProps> = ({ isOpen, onClose, onSelectDesign }) => {
  const { addItem } = useCart()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(STYLE_TEMPLATES[0])
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [genLogs, setGenLogs] = useState<string[]>([])
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  
  // Customization states
  const [selectedGarment, setSelectedGarment] = useState(GARMENTS[0])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedSize, setSelectedSize] = useState('L')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (generating) {
      const logs = [
        'Connecting to ThreadDrop Gen-3 Node...',
        'Parsing latent semantic vectors...',
        'Denoising canvas iterations (Step 1/15)...',
        'Refining high-frequency texture details (Step 5/15)...',
        'Applying cyberpunk tone curves (Step 10/15)...',
        'Upscaling raster layout to 4K vector scale...',
        'Compiling high-contrast print alpha maps...'
      ]
      
      let stepIndex = 0
      setGenLogs([logs[0]])
      
      const interval = setInterval(() => {
        stepIndex++
        if (stepIndex < logs.length) {
          setGenLogs(prev => [...prev, logs[stepIndex]])
          setGenStep(stepIndex)
        } else {
          clearInterval(interval)
          // Generate 4 variation images from templates
          setGeneratedDesigns([
            selectedStyle.designOverlay,
            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
            'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=400&q=80',
            'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80'
          ])
          setSelectedDesign(selectedStyle.designOverlay)
          setGenerating(false)
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [generating])

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a concept prompt first!')
      return
    }
    setGenerating(true)
    setGeneratedDesigns([])
    setSelectedDesign(null)
  }

  const handleApplyPreset = (preset: typeof STYLE_TEMPLATES[0]) => {
    setSelectedStyle(preset)
    setPrompt(preset.prompt)
  }

  const handleAddToCart = () => {
    if (!selectedDesign) {
      toast.error('Generate and select a design first!')
      return
    }

    if (onSelectDesign) {
      onSelectDesign(selectedDesign)
      toast.success('AI design selected for product catalog!')
      onClose()
      return
    }

    // Surgical mockups add to cart
    addItem({
      variant_id: `custom-${Date.now()}-${selectedGarment.id}-${selectedColor.name}`,
      quantity: qty,
      product_name: `AI Custom Print [${selectedStyle.name}]`,
      variant_size: selectedSize,
      variant_color: selectedColor.name,
      unit_price: selectedGarment.price,
      // Pass the selected template thumbnail representing mockup
      image_url: selectedDesign,
      printful_variant_id: 4001,
      printful_sync_variant_id: null,
      sku: `CUSTOM-${selectedGarment.id.toUpperCase()}-${selectedColor.name.substring(0,3).toUpperCase()}`,
      product_slug: 'custom-ai-print'
    })

    toast.success('Custom AI design added to bag!')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-2xl bg-neutral-950 border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-glow max-h-[90vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors hover:scale-105 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Generative Workshop Prompt Block */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-brand-400 animate-pulse" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI Print Engine</h2>
            </div>
            
            {/* Style Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Vibe Template</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyPreset(tmpl)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      selectedStyle.id === tmpl.id 
                        ? 'border-brand-500 bg-brand-500/5 text-brand-300 shadow-glow-sm' 
                        : 'border-white/[0.05] bg-white/[0.01] text-gray-400 hover:border-white/10 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{tmpl.name}</span>
                    <span className="text-[10px] text-gray-500 mt-1 line-clamp-1">{tmpl.tags.join(' • ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Describe Your Concept</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt e.g., A cyber punk gasmask overlayed with glowing circuit patterns, chrome rendering..."
                className="w-full h-32 rounded-xl bg-surface-950 border border-white/[0.08] p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none font-mono"
              />
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 rounded-xl font-bold bg-brand-gradient hover:shadow-glow text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? `Rendering Design...` : 'Generate Concept Art'}</span>
            </button>

            {/* Neural Net simulated generation status console */}
            {generating && (
              <div className="rounded-xl border border-brand-500/20 bg-black/60 p-4 font-mono text-[10px] text-brand-300 space-y-1.5 h-36 overflow-y-auto">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-brand-gradient h-full transition-all duration-300"
                    style={{ width: `${(genStep + 1) * 14.2}%` }}
                  />
                </div>
                {genLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-brand-500">▶</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Design Results Grid */}
            {!generating && generatedDesigns.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Output Version</label>
                <div className="grid grid-cols-4 gap-2">
                  {generatedDesigns.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDesign(url)}
                      className={`relative aspect-square rounded-lg border overflow-hidden transition-all ${
                        selectedDesign === url ? 'border-brand-400 ring-2 ring-brand-400/50 scale-95' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <img src={url} alt="Variations" className="w-full h-full object-cover" />
                      {selectedDesign === url && (
                        <span className="absolute top-1 right-1 bg-brand-500 text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Customizer & Mockup Mapping Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-neutral-950/60 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Mockup Preview</h3>

            {/* Simulated Live Mockup Viewbox */}
            <div className="relative aspect-square w-full rounded-2xl border border-white/[0.06] bg-black overflow-hidden flex items-center justify-center">
              {/* Garment Base Layer */}
              <img 
                src={selectedGarment.baseMockup} 
                alt="Apparel Base" 
                className="w-full h-full object-cover opacity-90 transition-all duration-300"
                style={{ filter: `drop-shadow(0px 10px 20px rgba(0,0,0,0.4))` }}
              />

              {/* Garment Overlay Color Mask (CSS Blend Simulation) */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-70 transition-all duration-300"
                style={{ backgroundColor: selectedColor.value }}
              />

              {/* Dynamic Placement Graphic Overlay */}
              {selectedDesign && (
                <div 
                  className="absolute w-[36%] aspect-square rounded-lg overflow-hidden border border-white/10 shadow-lg pointer-events-none transition-all duration-500 scale-90"
                  style={{
                    top: selectedGarment.id === 'tee' ? '38%' : '44%',
                    left: '32%',
                    transform: 'rotate(-1deg)',
                    mixBlendMode: 'screen',
                    opacity: 0.85
                  }}
                >
                  <img src={selectedDesign} alt="Design Layer" className="w-full h-full object-cover contrast-110 brightness-105" />
                </div>
              )}

              {/* Graphic bounding box frame */}
              <div 
                className="absolute w-[40%] aspect-[1/1.2] border border-brand-500/25 border-dashed pointer-events-none flex items-start justify-center pt-1"
                style={{
                  top: selectedGarment.id === 'tee' ? '35%' : '40%',
                  left: '30%',
                }}
              >
                <span className="text-[8px] font-mono text-brand-400 uppercase tracking-widest bg-black/60 px-1 border border-brand-500/10">Print Area</span>
              </div>
            </div>

            {/* Customization Sliders */}
            <div className="grid grid-cols-2 gap-4">
              {/* Garment Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Garment</label>
                <select
                  value={selectedGarment.id}
                  onChange={(e) => {
                    const match = GARMENTS.find(g => g.id === e.target.value)
                    if (match) setSelectedGarment(match)
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-surface-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-brand-500 font-bold"
                >
                  {GARMENTS.map(g => (
                    <option key={g.id} value={g.id}>{g.name} - ${g.price}</option>
                  ))}
                </select>
              </div>

              {/* Size selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Size</label>
                <div className="flex gap-1">
                  {SIZES.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 py-2 rounded-lg border text-center text-xs font-bold transition-all ${
                        selectedSize === sz 
                          ? 'border-brand-400 bg-brand-500/5 text-brand-300 font-extrabold' 
                          : 'border-white/[0.05] bg-white/[0.01] text-gray-400 hover:border-white/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Swatch Circle grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Garment Fabric Color</label>
              <div className="flex gap-3">
                {COLORS.map((clr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(clr)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform duration-200 hover:scale-110 active:scale-95 flex items-center justify-center ${clr.class} ${
                      selectedColor.name === clr.name ? 'ring-2 ring-brand-400/55 scale-105 border-white' : 'border-transparent'
                    }`}
                    title={clr.name}
                  >
                    {selectedColor.name === clr.name && (
                      <Check className={`h-4.5 w-4.5 ${clr.name === 'Eggshell White' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart button */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Unit Custom Price</span>
              <span className="text-2xl font-black text-white tracking-tight">${selectedGarment.price}</span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-8 py-3.5 rounded-xl font-bold bg-brand-gradient hover:shadow-glow text-white text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{onSelectDesign ? 'Select Design' : 'Print & Checkout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
