import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Sidebar from '../components/admin/Sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
