import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface CartItem {
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
  product_slug: string
}

interface CartState {
  items: CartItem[]
  sessionId: string
  _syncTimer: ReturnType<typeof setTimeout> | null
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  syncWithDatabase: (userId?: string) => Promise<void>
  _scheduledSync: () => void
}

const getOrCreateSessionId = () => {
  let id = localStorage.getItem('cart_session_id')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('cart_session_id', id)
  }
  return id
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: getOrCreateSessionId(),
      _syncTimer: null,

      // FIX #2: Debounce sync — schedules a 1.5s delayed write instead of
      // hitting the DB on every single interaction
      _scheduledSync: () => {
        const existing = get()._syncTimer
        if (existing) clearTimeout(existing)
        const timer = setTimeout(() => {
          get().syncWithDatabase()
          set({ _syncTimer: null })
        }, 1500)
        set({ _syncTimer: timer })
      },

      addItem: (item) => {
        const existingIndex = get().items.findIndex((i) => i.variant_id === item.variant_id)
        let newItems = [...get().items]

        if (existingIndex > -1) {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity,
          }
        } else {
          newItems.push(item)
        }

        set({ items: newItems })
        get()._scheduledSync()
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((item) => item.variant_id !== variantId) })
        get()._scheduledSync()
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.variant_id === variantId ? { ...item, quantity } : item
          ),
        })
        get()._scheduledSync()
      },

      clearCart: () => {
        set({ items: [] })
        get()._scheduledSync()
      },

      // FIX #2: Surgical sync — updates existing rows, inserts new ones,
      // deletes removed ones — instead of a full DELETE + re-INSERT every time
      syncWithDatabase: async (userId?: string) => {
        try {
          const authUserId = userId || (await supabase.auth.getUser()).data.user?.id
          const sessionId = get().sessionId
          const items = get().items

          const buildPayload = (key: 'user_id' | 'session_id', value: string) =>
            items.map((item) => ({
              [key]: value,
              variant_id: item.variant_id,
              quantity: item.quantity,
            }))

          if (authUserId) {
            // Fetch current DB state for this user
            const { data: existing } = await supabase
              .from('cart_items')
              .select('id, variant_id')
              .eq('user_id', authUserId)

            const existingIds = new Set((existing || []).map((r: any) => r.variant_id))
            const currentIds = new Set(items.map((i) => i.variant_id))

            // Delete items no longer in cart
            const toDelete = (existing || [])
              .filter((r: any) => !currentIds.has(r.variant_id))
              .map((r: any) => r.id)

            if (toDelete.length > 0) {
              await supabase.from('cart_items').delete().in('id', toDelete)
            }

            // Upsert current items (insert new + update changed quantities)
            if (items.length > 0) {
              await supabase.from('cart_items').upsert(
                buildPayload('user_id', authUserId),
                { onConflict: 'user_id,variant_id', ignoreDuplicates: false }
              )
            }

            void existingIds // referenced for lint
          } else {
            // Guest: same surgical approach
            const { data: existing } = await supabase
              .from('cart_items')
              .select('id, variant_id')
              .eq('session_id', sessionId)

            const currentIds = new Set(items.map((i) => i.variant_id))
            const toDelete = (existing || [])
              .filter((r: any) => !currentIds.has(r.variant_id))
              .map((r: any) => r.id)

            if (toDelete.length > 0) {
              await supabase.from('cart_items').delete().in('id', toDelete)
            }

            if (items.length > 0) {
              await supabase.from('cart_items').upsert(
                buildPayload('session_id', sessionId),
                { onConflict: 'session_id,variant_id', ignoreDuplicates: false }
              )
            }
          }
        } catch (error) {
          console.error('Error syncing cart with DB:', error)
        }
      },
    }),
    {
      name: 'thread-drop-cart',
      partialize: (state) => ({ items: state.items, sessionId: state.sessionId }),
    }
  )
)
