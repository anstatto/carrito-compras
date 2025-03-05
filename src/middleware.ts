import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/acuerdopago',
  '/perfil',
  '/pedidos',
  '/favoritos',
];

// Rutas solo para usuarios NO autenticados
const authRoutes = ['/login', '/registro'];

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Si el usuario está autenticado y trata de acceder a rutas de auth
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el usuario NO está autenticado y trata de acceder a rutas protegidas
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Manejo especial para rutas de admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas protegidas
    '/acuerdopago/:path*',
    '/perfil/:path*',
    '/pedidos/:path*',
    '/favoritos/:path*',
    // Rutas de autenticación
    '/login',
    '/registro',
    // Rutas de admin
    '/admin/:path*',
  ],
}; 