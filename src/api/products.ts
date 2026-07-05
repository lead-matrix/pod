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

  getProducts: async (options?: { categorySlug?: string; featuredOnly?: boolean; search?: string }): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true)
    }

    if (options?.categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .single()

      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
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

  getAdminProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })

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

    // Insert Product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        ...product,
        slug,
      })
      .select()
      .single()

    if (productError) throw productError

    // Insert Variants
    if (variants.length > 0) {
      const variantPayload = variants.map((v) => ({
        ...v,
        product_id: newProduct.id,
      }))
      const { error: variantError } = await supabase.from('product_variants').insert(variantPayload)
      if (variantError) throw variantError
    }

    // Insert Images
    if (images.length > 0) {
      const imagePayload = images.map((img) => ({
        ...img,
        product_id: newProduct.id,
      }))
      const { error: imageError } = await supabase.from('product_images').insert(imagePayload)
      if (imageError) throw imageError
    }

    return newProduct as Product
  },

  updateProduct: async (
    id: string,
    product: Partial<Product>,
    variants?: Array<Partial<ProductVariant> & { id?: string }>,
    images?: Array<Partial<ProductImage> & { id?: string }>
  ): Promise<void> => {
    // Update Product Info
    const { error: productError } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)

    if (productError) throw productError

    // Sync/Update Variants
    if (variants) {
      for (const variant of variants) {
        if (variant.id) {
          await supabase.from('product_variants').update(variant).eq('id', variant.id)
        } else {
          await supabase.from('product_variants').insert({ ...variant, product_id: id })
        }
      }
    }

    // Sync/Update Images
    if (images) {
      for (const image of images) {
        if (image.id) {
          await supabase.from('product_images').update(image).eq('id', image.id)
        } else {
          await supabase.from('product_images').insert({ ...image, product_id: id })
        }
      }
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
