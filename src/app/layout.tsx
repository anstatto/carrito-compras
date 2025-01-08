import { Providers } from './providers'
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
          {children}
        </Providers>
      </body>
    </html>
  )
}