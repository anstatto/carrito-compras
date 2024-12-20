"use client"

import { useSession } from "next-auth/react"

export const AdminCheck = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  
  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return <>{children}</>
} 