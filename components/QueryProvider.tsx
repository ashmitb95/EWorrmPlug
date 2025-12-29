'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Music data doesn't change often, so cache longer
            staleTime: 5 * 60 * 1000, // 5 minutes for music data
            gcTime: 30 * 60 * 1000, // 30 minutes garbage collection (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
            // Optimize for music app - don't refetch aggressively
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
