import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// FIX #6: Exponential backoff retry + sensible global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry up to 3 times with exponential backoff (1s, 2s, 4s)
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      // Window focus refetch disabled globally — opted in per-query where needed
      // (e.g. useAdminOrders re-enables it for live order freshness)
      refetchOnWindowFocus: false,
      // Default stale time — individual hooks override this as needed
      staleTime: 1000 * 30, // 30 seconds
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
