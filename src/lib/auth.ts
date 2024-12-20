import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [] // Agregado el campo requerido providers
  // ... resto de la configuración de NextAuth
}
