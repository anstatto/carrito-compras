import { Providers } from './providers'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import './globals.css'

export const metadata = {
  title: 'Arlin Glow Care',
  description: 'Tu tienda de belleza y cuidado personal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
