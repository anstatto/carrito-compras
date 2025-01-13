'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster, toast } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Session } from 'next-auth'

const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnMount: true,
      onError: (error: Error) => {
        console.error('Error en consulta:', error)
        toast.error('Error de conexión')
      }
    },
    mutations: {
      retry: 1,
      onError: (error: Error) => {
        console.error('Error en mutación:', error)
        toast.error('Error al procesar la solicitud')
      }
    }
  }
}

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  useEffect(() => {
    setMounted(true)
    
    // Limpieza al desmontar
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              className: 'bg-white dark:bg-gray-800 dark:text-white',
              style: {
                borderRadius: '10px',
                padding: '16px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #10B981',
                }
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #EF4444',
                }
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}