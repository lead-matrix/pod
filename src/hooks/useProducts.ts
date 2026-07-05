import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, Product, ProductVariant, ProductImage } from '../api/products'

// Shared stale times
const STALE_5MIN = 1000 * 60 * 5
const STALE_1MIN = 1000 * 60 * 1

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    staleTime: STALE_5MIN,   // categories rarely change
    gcTime: STALE_5MIN * 2,
  })
}

// FIX #3: Stable primitive query key — prevents unnecessary refetches when
// the options object reference changes but the values are the same
export const useProducts = (options?: {
  categorySlug?: string
  featuredOnly?: boolean
  search?: string
  page?: number
  pageSize?: number
}) => {
  return useQuery({
    queryKey: [
      'products',
      options?.categorySlug ?? null,
      options?.featuredOnly ?? false,
      options?.search ?? '',
      options?.page ?? 1,
      options?.pageSize ?? 24,
    ],
    queryFn: () => productsApi.getProducts(options),
    staleTime: STALE_1MIN,
    gcTime: STALE_5MIN,
    placeholderData: (prev) => prev, // keepPreviousData equivalent in v5
  })
}

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: STALE_5MIN,
    gcTime: STALE_5MIN * 2,
  })
}

export const useAdminProducts = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: ['admin-products', page, pageSize],
    queryFn: () => productsApi.getAdminProducts({ page, pageSize }),
    staleTime: STALE_1MIN,
    placeholderData: (prev) => prev,
  })
}

export const useAdminProductById = (id: string) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productsApi.getAdminProductById(id),
    enabled: !!id,
    staleTime: STALE_1MIN,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      product,
      variants,
      images,
    }: {
      product: Omit<Product, 'id' | 'slug' | 'created_at' | 'updated_at'>
      variants: Array<Omit<ProductVariant, 'id' | 'product_id'>>
      images: Array<Omit<ProductImage, 'id' | 'product_id'>>
    }) => productsApi.createProduct(product, variants, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      product,
      variants,
      images,
    }: {
      id: string
      product: Partial<Product>
      variants?: Array<Partial<ProductVariant> & { id?: string }>
      images?: Array<Partial<ProductImage> & { id?: string }>
    }) => productsApi.updateProduct(id, product, variants, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', variables.id] })
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}
