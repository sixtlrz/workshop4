import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le cookie de session Supabase
  const supabaseToken = request.cookies.get('sb-access-token')?.value || 
                         request.cookies.get('sb-jjewkbqgvkafiylcrqsh-auth-token')?.value;

  const { pathname } = request.nextUrl;

  // Routes protégées
  const protectedRoutes = ['/dashboard'];
  const protectedApiRoutes = ['/api/generate', '/api/delete'];

  // Vérifier si la route est protégée
  const isProtectedPage = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

  // Si route protégée et pas de token, rediriger vers login
  if ((isProtectedPage || isProtectedApi) && !supabaseToken) {
    if (isProtectedApi) {
      // Pour les API, retourner 401
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    // Pour les pages, rediriger vers login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate/:path*',
    '/api/delete/:path*',
  ],
};
