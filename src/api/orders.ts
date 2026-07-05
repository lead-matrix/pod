import { supabase } from '../lib/supabase'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_size: string
  variant_color: string | null
  sku: string | null
  image_url: string | null
  printful_variant_id: number
  printful_sync_variant_id: number | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderTracking {
  id: string
  order_id: string
  carrier: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  status: string | null
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_email: string
  customer_name: string
  shipping_name: string
  shipping_address1: string
  shipping_address2: string | null
  shipping_city: string
  shipping_state: string | null
  shipping_country: string
  shipping_zip: string
  shipping_phone: string | null
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  currency: string
  printful_order_id: number | null
  printful_status: string | null
  customer_notes: string | null
  internal_notes: string | null
  created_at: string
  paid_at: string | null
  fulfilled_at: string | null
  shipped_at: string | null
  order_items?: OrderItem[]
  order_tracking?: OrderTracking[]
}

export const ordersApi = {
  createCheckoutSession: async (payload: {
    items: Array<{
      variant_id: string
      quantity: number
      product_name: string
      variant_size: string
      variant_color: string
      unit_price: number
      image_url: string
      printful_variant_id: number
      printful_sync_variant_id: number | null
      sku: string
    }>
    customer_email: string
    customer_name: string
    user_id?: string
    success_url: string
    cancel_url: string
  }): Promise<{ url: string; session_id: string; order_id: string }> => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `Checkout failed: ${response.status}`)
    }

    return response.json()
  },

  getUserOrders: async (): Promise<Order[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Order[]
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), order_tracking(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Order
  },

  // Admin-only calls
  getAdminOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Order[]
  },

  updateOrderStatus: async (id: string, status: Order['status'], internalNotes?: string): Promise<void> => {
    const updates: Partial<Order> = { status }
    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  },

  resubmitToPrintful: async (_orderId: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-proxy/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    // NOTE: In production, this can also call a dedicated resubmit endpoint or trigger
    // the Stripe webhook logic.
    if (!response.ok) {
      throw new Error(`Failed to resubmit: ${response.statusText}`)
    }
  },
}
