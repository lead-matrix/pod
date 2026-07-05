import { supabase } from '../lib/supabase'

const getProxyHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
  }
}

export const printfulApi = {
  get: async <T>(path: string): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`, {
      method: 'GET',
      headers,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  post: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  put: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  delete: async <T>(path: string): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`, {
      method: 'DELETE',
      headers,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  // Specific helper functions
  getCatalogProducts: async (category_id?: number) => {
    const query = category_id ? `?category_id=${category_id}` : ''
    return printfulApi.get<{ result: Array<{ id: number; name: string; image_url: string; type: string }> }>(`/products${query}`)
  },

  getCatalogProductDetails: async (id: number) => {
    return printfulApi.get<{
      result: {
        product: { id: number; name: string; image_url: string; type: string }
        variants: Array<{
          id: number
          product_id: number
          name: string
          size: string
          color: string
          color_code: string
          color_code2: string
          image: string
          price: string
          in_stock: boolean
        }>
      }
    }>(`/products/${id}`)
  },

  createMockupTask: async (productId: number, body: { variant_ids: number[]; format: string; files: Array<{ type: string; url: string }> }) => {
    return printfulApi.post<{ result: { status: string; task_id: string } }>(`/mockup-generator/create-task/${productId}`, body)
  },

  getMockupTaskResult: async (taskId: string) => {
    return printfulApi.get<{ result: { status: string; mockups: Array<{ variant_ids: number[]; extra: Array<{ title: string; url: string }> }> } }>(`/mockup-generator/task?task_key=${taskId}`)
  },

  getShippingQuotes: async (body: { recipient: { address1: string; city: string; country_code: string; state_code?: string; zip: string }; items: Array<{ variant_id: number; quantity: number }> }) => {
    return printfulApi.post<{ result: Array<{ id: string; name: string; rate: string; minDeliveryDays: number; maxDeliveryDays: number }> }>(`/shipping/calculate`, body)
  },
}
