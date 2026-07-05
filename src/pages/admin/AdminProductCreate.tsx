import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { DesignUploader } from '../../components/admin/DesignUploader'
import { VariantPricing } from '../../components/admin/VariantPricing'
import { MockupPreview } from '../../components/admin/MockupPreview'
import { usePrintfulProductDetails, useCreateMockupTask } from '../../hooks/usePrintful'
import { useCreateProduct } from '../../hooks/useProducts'
import { printfulApi } from '../../api/printful'
import toast from 'react-hot-toast'

export const AdminProductCreate: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const catalogProductId = parseInt(searchParams.get('catalog_id') || '0')

  const { data: printfulDetails, isLoading: loadingDetails } = usePrintfulProductDetails(catalogProductId)
  const createMockupTaskMutation = useCreateMockupTask()
  const createProductMutation = useCreateProduct()

  // State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [designUrl, setDesignUrl] = useState('')
  const [designPath, setDesignPath] = useState('')
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([])
  const [pricingMap, setPricingMap] = useState<Record<number, { retail_price: number; compare_at_price?: number }>>({})
  const [mockupTaskId, setMockupTaskId] = useState<string | null>(null)
  const [mockupUrls, setMockupUrls] = useState<Array<{ url: string; variant_ids: number[] }>>([])
  const [saving, setSaving] = useState(false)

  if (loadingDetails) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  const baseProduct = printfulDetails?.result?.product
  const variants = printfulDetails?.result?.variants || []

  const handleUploadComplete = (url: string, path: string) => {
    setDesignUrl(url)
    setDesignPath(path)
  }

  const handlePricingChange = (variantId: number, field: 'retail_price' | 'compare_at_price', value: number) => {
    setPricingMap((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value,
      },
    }))
  }

  const handleGenerateMockups = async () => {
    if (!designUrl) {
      toast.error('Please upload a design file first.')
      return
    }
    if (selectedVariantIds.length === 0) {
      toast.error('Please select at least one variant.')
      return
    }

    try {
      const res = await createMockupTaskMutation.mutateAsync({
        productId: catalogProductId,
        variant_ids: selectedVariantIds,
        format: 'png',
        files: [{ type: 'front', url: designUrl }],
      })
      if (res.result?.task_id) {
        setMockupTaskId(res.result.task_id)
        toast.success('Mockup generation task started.')
      }
    } catch (err) {
      toast.error('Failed to trigger mockup generation.')
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error('Please enter a product name.')
    if (selectedVariantIds.length === 0) return toast.error('Please select variants.')
    if (mockupUrls.length === 0 && !mockupTaskId) {
      return toast.error('Please generate mockups first.')
    }

    try {
      setSaving(true)

      // 1. Submit Sync Product to Printful
      const printfulPayload = {
        sync_product: { name },
        sync_variants: selectedVariantIds.map((vid) => {
          const pricing = pricingMap[vid] || { retail_price: Math.round(parseFloat(variants.find(v => v.id === vid)?.price || '15') * 1.5) }
          return {
            variant_id: vid,
            retail_price: String(pricing.retail_price),
            files: [{ type: 'front', url: designUrl }],
          }
        }),
      }

      const syncRes = await printfulApi.post<{ result: { id: number; sync_variants: Array<{ id: number; variant_id: number; external_id: string }> } }>(
        '/sync/products',
        printfulPayload
      )
      const printfulSyncProductId = syncRes.result.id

      // 2. Insert into Supabase
      const productInput = {
        name,
        description,
        category_id: null,
        printful_sync_product_id: printfulSyncProductId,
        printful_catalog_id: catalogProductId,
        printful_store_id: null,
        design_file_url: designUrl,
        design_file_path: designPath,
        thumbnail_url: mockupUrls[0]?.url || '',
        is_active: true,
        is_featured: false,
        tags: [] as string[],
        seo_title: name,
        seo_description: description,
        base_price: pricingMap[selectedVariantIds[0]]?.retail_price || 0,
      }

      const variantInputs = selectedVariantIds.map((vid) => {
        const vDetails = variants.find((v) => v.id === vid)!
        const pricing = pricingMap[vid] || { retail_price: Math.round(parseFloat(vDetails.price) * 1.5) }
        const matchedSync = syncRes.result.sync_variants.find((sv) => sv.variant_id === vid)

        return {
          printful_sync_variant_id: matchedSync?.id || null,
          printful_variant_id: vid,
          printful_product_id: null,
          size: vDetails.size,
          color: vDetails.color || null,
          color_hex: vDetails.color_code || null,
          sku: matchedSync?.external_id || null,
          retail_price: pricing.retail_price,
          compare_at_price: pricing.compare_at_price || null,
          in_stock: vDetails.in_stock,
          stock_level: null,
          image_url: mockupUrls.find((m) => m.variant_ids.includes(vid))?.url || null,
        }
      })

      const imageInputs = mockupUrls.map((m, idx) => ({
        url: m.url,
        alt_text: `${name} Mockup`,
        sort_order: idx,
        is_primary: idx === 0,
        color: variants.find((v) => m.variant_ids.includes(v.id))?.color || null,
      }))

      await createProductMutation.mutateAsync({
        product: productInput,
        variants: variantInputs,
        images: imageInputs,
      })

      toast.success('Product created and synced successfully!')
      navigate('/admin/products')
    } catch (err) {
      console.error('Save product error:', err)
      toast.error('Failed to save product and sync variants.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSaveProduct} className="space-y-8 max-w-4xl pb-20">
      {/* Back & Save actions */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/catalog')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Create drop</h1>
            <p className="text-gray-400 text-sm mt-1">Design base item: {baseProduct?.name}</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="glass-button-primary flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          Publish Drop
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Info details */}
        <div className="md:col-span-2 space-y-6">
          {/* General info */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">General Information</h3>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vintage Heavyweight Hoodie"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 100% cotton premium box fit streetwear apparel..."
                className="glass-input w-full h-32"
              />
            </div>
          </div>

          {/* Variant matrix pricing details */}
          <VariantPricing
            variants={variants}
            selectedVariantIds={selectedVariantIds}
            onChangeSelection={setSelectedVariantIds}
            pricingMap={pricingMap}
            onChangePricing={handlePricingChange}
          />
        </div>

        {/* Right Col: Media files and mockup preview tools */}
        <div className="space-y-6">
          {/* File uploader */}
          <div className="glass-card p-6">
            <DesignUploader onUploadComplete={handleUploadComplete} />
          </div>

          {/* Mockup trigger action */}
          {designUrl && selectedVariantIds.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Generate Mockups</h3>
              <p className="text-xs text-gray-400 leading-normal">
                Trigger the Printful API to apply your design onto mockup variants before publishing.
              </p>
              <button
                type="button"
                onClick={handleGenerateMockups}
                className="w-full glass-button-secondary py-2.5"
              >
                Generate Previews
              </button>
            </div>
          )}

          {/* Mockup preview result handler */}
          <MockupPreview
            taskId={mockupTaskId}
            onGenerationComplete={setMockupUrls}
          />
        </div>
      </div>
    </form>
  )
}
