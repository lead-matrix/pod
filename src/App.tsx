import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { StorefrontLayout } from './components/layout/StorefrontLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './router/ProtectedRoute'

// Storefront pages
import { HomePage } from './pages/storefront/HomePage'
import { ShopPage } from './pages/storefront/ShopPage'
import { ProductPage } from './pages/storefront/ProductPage'
import { CartPage } from './pages/storefront/CartPage'
import { CheckoutSuccessPage } from './pages/storefront/CheckoutSuccessPage'
import { AccountPage } from './pages/storefront/AccountPage'
import { LoginPage } from './pages/storefront/LoginPage'

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminProductCreate } from './pages/admin/AdminProductCreate'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail'
import { AdminCatalog } from './pages/admin/AdminCatalog'
import { AdminSettings } from './pages/admin/AdminSettings'

import { useAuthStore } from './store/authStore'

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-surface-900 border border-white/[0.08] text-white rounded-xl',
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Storefront storefront routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/create" element={<AdminProductCreate />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/catalog" element={<AdminCatalog />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
export default App
