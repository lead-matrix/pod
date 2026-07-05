import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, Order } from '../api/orders'

export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: () => ordersApi.getUserOrders(),
  })
}

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  })
}

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAdminOrders(),
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
