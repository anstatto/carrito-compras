'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { Session } from 'next-auth'

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000 // 5 minutos
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Error en mutación:', error)
        }
      }
    }
  }))

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >

            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                className: 'bg-white dark:bg-gray-800 dark:text-white',
                style: {
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </SessionProvider>
  )
}