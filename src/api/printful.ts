import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

// FIX #4: Module-level session cache — avoids a getSession() call on every
// single Printful API request. Invalidated on auth state changes.
let _cachedSession: Session | null = null
let _sessionFetchedAt = 0
const SESSION_TTL_MS = 1000 * 60 * 4 // 4 minutes (tokens expire at 5 min)

// Listen for auth changes to invalidate cache immediately
supabase.auth.onAuthStateChange((_event, session) => {
  _cachedSession = session
  _sessionFetchedAt = Date.now()
})

const getProxyHeaders = async () => {
  const now = Date.now()
  // Use cached session if still fresh
  if (!_cachedSession || now - _sessionFetchedAt > SESSION_TTL_MS) {
    const { data: { session } } = await supabase.auth.getSession()
    _cachedSession = session
    _sessionFetchedAt = now
  }

  return {
    'Content-Type': 'application/json',
    ...(_cachedSession ? { 'Authorization': `Bearer ${_cachedSession.access_token}` } : {}),
  }
}

// FIX #4: In-memory catalog cache so repeated browsing doesn't re-hit the proxy
const _catalogCache = new Map<string, { data: unknown; fetchedAt: number }>()
const CATALOG_TTL_MS = 1000 * 60 * 10 // 10 minutes

const cachedGet = async <T>(path: string): Promise<T> => {
  const cached = _catalogCache.get(path)
  if (cached && Date.now() - cached.fetchedAt < CATALOG_TTL_MS) {
    return cached.data as T
  }
  const data = await printfulApi.get<T>(path)
  _catalogCache.set(path, { data, fetchedAt: Date.now() })
  return data
}

export const printfulApi = {
  get: async <T>(path: string): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`,
      { method: 'GET', headers }
    )
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  post: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`,
      { method: 'POST', headers, body: JSON.stringify(body) }
    )
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  put: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`,
      { method: 'PUT', headers, body: JSON.stringify(body) }
    )
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  delete: async <T>(path: string): Promise<T> => {
    const headers = await getProxyHeaders()
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy${path}`,
      { method: 'DELETE', headers }
    )
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Proxy error: ${response.status}`)
    }
    return response.json()
  },

  // FIX #4: Use cachedGet for catalog — repeat browsing hits local cache
  getCatalogProducts: async (category_id?: number) => {
    const query = category_id ? `?category_id=${category_id}` : ''
    return cachedGet<{ result: Array<{ id: number; name: string; image_url: string; type: string }> }>(
      `/products${query}`
    )
  },

  getCatalogProductDetails: async (id: number) => {
    return cachedGet<{
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

  createMockupTask: async (
    productId: number,
    body: { variant_ids: number[]; format: string; files: Array<{ type: string; url: string }> }
  ) => {
    return printfulApi.post<{ result: { status: string; task_id: string } }>(
      `/mockup-generator/create-task/${productId}`,
      body
    )
  },

  getMockupTaskResult: async (taskId: string) => {
    return printfulApi.get<{
      result: {
        status: string
        mockups: Array<{ variant_ids: number[]; extra: Array<{ title: string; url: string }> }>
      }
    }>(`/mockup-generator/task?task_key=${taskId}`)
  },

  getShippingQuotes: async (body: {
    recipient: { address1: string; city: string; country_code: string; state_code?: string; zip: string }
    items: Array<{ variant_id: number; quantity: number }>
  }) => {
    return printfulApi.post<{
      result: Array<{ id: string; name: string; rate: string; minDeliveryDays: number; maxDeliveryDays: number }>
    }>(`/shipping/calculate`, body)
  },
}
