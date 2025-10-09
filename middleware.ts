import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Routes protégées
    const protectedRoutes = ['/dashboard'];
    const protectedApiRoutes = ['/api/generate', '/api/delete'];

    // Vérifier si la route est protégée
    const isProtectedPage = protectedRoutes.some(route => pathname.startsWith(route));
    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

    // Chercher tous les cookies Supabase (le nom peut varier)
    const allCookies = request.cookies.getAll();
    const hasSupabaseAuth = allCookies.some(cookie =>
        cookie.name.includes('sb-') &&
        cookie.name.includes('auth-token')
    );

    // Si route protégée et pas de cookie d'auth Supabase
    if ((isProtectedPage || isProtectedApi) && !hasSupabaseAuth) {
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
        // Désactivé - l'authentification est gérée directement dans chaque route/composant
        // '/dashboard/:path*',
        // '/api/generate/:path*',
        // '/api/delete/:path*',
    ],
};
