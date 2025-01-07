import "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    role: Role
    nombre: string
    apellido: string
    activo: boolean
    isAdmin?: boolean
  }

  interface Session {
    user: User & {
      id: string
      email: string
      role: Role
      nombre: string
      apellido: string
      activo: boolean
      isAdmin?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    nombre: string
    apellido: string
    activo: boolean
    isAdmin?: boolean
  }
} 