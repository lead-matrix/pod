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
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  syncWithDatabase: (userId?: string) => Promise<void>
}

// Generate a random session ID for guest carts
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

      addItem: (item) => {
        const existingIndex = get().items.findIndex((i) => i.variant_id === item.variant_id)
        let newItems = [...get().items]

        if (existingIndex > -1) {
          newItems[existingIndex].quantity += item.quantity
        } else {
          newItems.push(item)
        }

        set({ items: newItems })
        get().syncWithDatabase()
      },

      removeItem: (variantId) => {
        const newItems = get().items.filter((item) => item.variant_id !== variantId)
        set({ items: newItems })
        get().syncWithDatabase()
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        const newItems = get().items.map((item) =>
          item.variant_id === variantId ? { ...item, quantity } : item
        )
        set({ items: newItems })
        get().syncWithDatabase()
      },

      clearCart: () => {
        set({ items: [] })
        get().syncWithDatabase()
      },

      syncWithDatabase: async (userId) => {
        try {
          const authUser = userId || (await supabase.auth.getUser()).data.user?.id
          const sessionId = get().sessionId
          const items = get().items

          if (authUser) {
            // Delete existing cart items for this user
            await supabase.from('cart_items').delete().eq('user_id', authUser)

            if (items.length > 0) {
              const dbItems = items.map((item) => ({
                user_id: authUser,
                variant_id: item.variant_id,
                quantity: item.quantity,
              }))
              await supabase.from('cart_items').insert(dbItems)
            }
          } else {
            // Guest session sync
            await supabase.from('cart_items').delete().eq('session_id', sessionId)

            if (items.length > 0) {
              const dbItems = items.map((item) => ({
                session_id: sessionId,
                variant_id: item.variant_id,
                quantity: item.quantity,
              }))
              await supabase.from('cart_items').insert(dbItems)
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
