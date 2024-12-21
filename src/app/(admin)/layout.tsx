import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Sidebar from '../components/admin/Sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background-pink">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
