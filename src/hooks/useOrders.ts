import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, Order } from '../api/orders'

const STALE_30S = 1000 * 30
const STALE_1MIN = 1000 * 60

export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: () => ordersApi.getUserOrders(),
    staleTime: STALE_1MIN,
  })
}

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
    staleTime: STALE_30S,
    // Poll every 30s for live shipping updates
    refetchInterval: (query) =>
      query.state.data?.status === 'shipped' ? false : STALE_30S,
  })
}

export const useAdminOrders = (page = 1, pageSize = 50, status?: Order['status']) => {
  return useQuery({
    queryKey: ['admin-orders', page, pageSize, status ?? null],
    queryFn: () => ordersApi.getAdminOrders({ page, pageSize, status }),
    staleTime: STALE_30S,
    placeholderData: (prev) => prev,
    // FIX #6: Re-enable window focus refetch for admin so order list stays fresh
    refetchOnWindowFocus: true,
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, internalNotes }: { id: string; status: Order['status']; internalNotes?: string }) =>
      ordersApi.updateOrderStatus(id, status, internalNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
    },
  })
}

export const useResubmitOrderToPrintful = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.resubmitToPrintful(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    },
  })
}
