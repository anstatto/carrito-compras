import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext'
import { Providers } from './providers'
import { Playfair_Display } from 'next/font/google'
import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Arlin Glow Care",
  description: "Productos de belleza y cuidado personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
