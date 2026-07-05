import { supabase } from '../lib/supabase'
import { generateSlug } from '../lib/utils'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  color: string | null
}

export interface ProductVariant {
  id: string
  product_id: string
  printful_sync_variant_id: number | null
  printful_variant_id: number
  size: string
  color: string | null
  color_hex: string | null
  sku: string | null
  retail_price: number
  compare_at_price: number | null
  in_stock: boolean
  stock_level: number | null
  image_url: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  printful_sync_product_id: number | null
  printful_catalog_id: number | null
  printful_store_id: string | null
  design_file_url: string | null
  design_file_path: string | null
  thumbnail_url: string | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  base_price: number | null
  created_at: string
  updated_at: string
  category?: Category
  product_variants?: ProductVariant[]
  product_images?: ProductImage[]
}

// ─── Pagination ────────────────────────────────────────────────
export interface PaginationOptions {
  page?: number   // 1-based
  pageSize?: number
}

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data as Category[]
  },

  // FIX #1: Eliminate N+1 – resolve category via a nested filter instead of
  // a separate round-trip; also accepts stable primitives for the query key.
  getProducts: async (options?: {
    categorySlug?: string
    featuredOnly?: boolean
    search?: string
    page?: number
    pageSize?: number
  }): Promise<Product[]> => {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 24
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('products')
      .select('*, category:categories!inner(*)')
      .eq('is_active', true)
      .range(from, to)
      .order('created_at', { ascending: false })

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true)
    }

    // FIX: Filter by category slug directly via the join – no extra query
    if (options?.categorySlug) {
      query = query.eq('categories.slug', options.categorySlug)
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), product_variants(*), product_images(*)')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Product
  },

  // FIX #7: Pagination for admin list
  getAdminProducts: async (options?: PaginationOptions): Promise<Product[]> => {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return data as Product[]
  },

  getAdminProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },

  createProduct: async (
    product: Omit<Product, 'id' | 'slug' | 'created_at' | 'updated_at'>,
    variants: Array<Omit<ProductVariant, 'id' | 'product_id'>>,
    images: Array<Omit<ProductImage, 'id' | 'product_id'>>
  ): Promise<Product> => {
    const slug = generateSlug(product.name)

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({ ...product, slug })
      .select()
      .single()

    if (productError) throw productError

    // FIX #8: Batch inserts instead of sequential loops
    if (variants.length > 0) {
      const variantPayload = variants.map((v) => ({ ...v, product_id: newProduct.id }))
      const { error: variantError } = await supabase.from('product_variants').insert(variantPayload)
      if (variantError) throw variantError
    }

    if (images.length > 0) {
      const imagePayload = images.map((img) => ({ ...img, product_id: newProduct.id }))
      const { error: imageError } = await supabase.from('product_images').insert(imagePayload)
      if (imageError) throw imageError
    }

    return newProduct as Product
  },

  // FIX #8: Replace sequential loops with batch UPSERT operations
  updateProduct: async (
    id: string,
    product: Partial<Product>,
    variants?: Array<Partial<ProductVariant> & { id?: string }>,
    images?: Array<Partial<ProductImage> & { id?: string }>
  ): Promise<void> => {
    const { error: productError } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)

    if (productError) throw productError

    if (variants && variants.length > 0) {
      const toUpdate = variants.filter((v) => v.id)
      const toInsert = variants.filter((v) => !v.id)

      // Batch upsert existing variants
      if (toUpdate.length > 0) {
        const { error } = await supabase
          .from('product_variants')
          .upsert(toUpdate.map((v) => ({ ...v, product_id: id })), { onConflict: 'id' })
        if (error) throw error
      }

      // Batch insert new variants
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('product_variants')
          .insert(toInsert.map((v) => ({ ...v, product_id: id })))
        if (error) throw error
      }
    }

    if (images && images.length > 0) {
      const toUpdate = images.filter((img) => img.id)
      const toInsert = images.filter((img) => !img.id)

      // Batch upsert existing images
      if (toUpdate.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .upsert(toUpdate.map((img) => ({ ...img, product_id: id })), { onConflict: 'id' })
        if (error) throw error
      }

      // Batch insert new images
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(toInsert.map((img) => ({ ...img, product_id: id })))
        if (error) throw error
      }
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
