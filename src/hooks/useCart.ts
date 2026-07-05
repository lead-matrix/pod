import { useCartStore } from '../store/cartStore'

export const useCart = () => {
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 5.99
  const total = subtotal + shipping

  return {
    items,
    cartCount,
    subtotal,
    shipping,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
