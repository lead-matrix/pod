import React from 'react'
import { StatsCard } from '../../components/admin/StatsCard'
import { OrdersTable } from '../../components/admin/OrdersTable'
import { useAdminOrders } from '../../hooks/useOrders'
import { Loader2 } from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const { data: orders = [], isLoading } = useAdminOrders()

  // Calculate quick metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'pending')
    .reduce((sum, o) => sum + Number(o.total), 0)

  const pendingCount = orders.filter((o) => o.status === 'paid').length
  const processingCount = orders.filter((o) => o.status === 'processing').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length

  const recentOrders = orders.slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time health of your custom streetwear store.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          change="12.3%"
          isPositive={true}
        />
        <StatsCard
          title="Paid (Awaiting Printful)"
          value={pendingCount}
        />
        <StatsCard
          title="In Production"
          value={processingCount}
        />
        <StatsCard
          title="Shipped Out"
          value={shippedCount}
        />
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Recent Orders</h2>
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}
