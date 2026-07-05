import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, Product, ProductVariant, ProductImage } from '../api/products'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  })
}

export const useProducts = (options?: { categorySlug?: string; featuredOnly?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => productsApi.getProducts(options),
  })
}

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
  })
}

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getAdminProducts(),
  })
}

export const useAdminProductById = (id: string) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productsApi.getAdminProductById(id),
    enabled: !!id,
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
