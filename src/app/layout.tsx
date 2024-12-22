import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import { Playfair_Display } from 'next/font/google'

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
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
