import React from 'react'
import { Loader2 } from 'lucide-react'
import { OrdersTable } from '../../components/admin/OrdersTable'
import { useAdminOrders } from '../../hooks/useOrders'

export const AdminOrders: React.FC = () => {
  const { data: orders = [], isLoading } = useAdminOrders()

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">Manage customer purchases and Printful auto-fulfillment logs.</p>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  )
}
