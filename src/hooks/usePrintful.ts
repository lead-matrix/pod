import { useQuery, useMutation } from '@tanstack/react-query'
import { printfulApi } from '../api/printful'

export const usePrintfulCatalog = (category_id?: number) => {
  return useQuery({
    queryKey: ['printful-catalog', category_id],
    queryFn: () => printfulApi.getCatalogProducts(category_id),
  })
}

export const usePrintfulProductDetails = (id: number) => {
  return useQuery({
    queryKey: ['printful-product-details', id],
    queryFn: () => printfulApi.getCatalogProductDetails(id),
    enabled: !!id,
  })
}

export const useCreateMockupTask = () => {
  return useMutation({
    mutationFn: ({ productId, variant_ids, format, files }: {
      productId: number
      variant_ids: number[]
      format: string
      files: Array<{ type: string; url: string }>
    }) => printfulApi.createMockupTask(productId, { variant_ids, format, files }),
  })
}

export const useMockupTaskResult = (taskId: string) => {
  return useQuery({
    queryKey: ['mockup-task', taskId],
    queryFn: () => printfulApi.getMockupTaskResult(taskId),
    enabled: !!taskId,
    refetchInterval: (data) => {
      // Keep polling every 2.5 seconds if the status is pending
      if (data?.state?.data?.result?.status === 'pending') {
        return 2500
      }
      return false
    },
  })
}

export const useShippingQuotes = () => {
  return useMutation({
    mutationFn: (body: {
      recipient: { address1: string; city: string; country_code: string; state_code?: string; zip: string }
      items: Array<{ variant_id: number; quantity: number }>
    }) => printfulApi.getShippingQuotes(body),
  })
}
