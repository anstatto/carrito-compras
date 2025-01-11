import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { Role } from "@prisma/client"
import { getServerSession } from "next-auth"

export async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('No autorizado')
  }
  return session
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales incompletas')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email,
              activo: true
            },
            include: {
              carritoItems: true
            }
          })

          if (!user || !user.password) {
            throw new Error('Usuario no encontrado o inactivo')
          }

          const passwordValid = await compare(credentials.password, user.password)

          if (!passwordValid) {
            throw new Error('Contraseña incorrecta')
          }

          return {
            ...user,
            isAdmin: user.role === 'ADMIN'
          }
        } catch (error) {
          console.error('Error en authorize:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nombre = user.nombre
        token.apellido = user.apellido
        token.activo = user.activo
        token.isAdmin = user.role === 'ADMIN'
        token.stripeCustomerId = user.stripeCustomerId
        token.carritoActualizado = user.carritoActualizado
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role as Role
        session.user.nombre = token.nombre
        session.user.apellido = token.apellido
        session.user.activo = token.activo
        session.user.isAdmin = token.role === 'ADMIN'
        session.user.stripeCustomerId = token.stripeCustomerId
        session.user.carritoActualizado = token.carritoActualizado as Date | null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}
