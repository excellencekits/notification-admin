import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies
  const accessToken =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('access_token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Protected paths that require active login
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/providers') ||
    pathname.startsWith('/logs') ||
    pathname.startsWith('/test-send');

  // If trying to access protected route without token, redirect to /login
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // If already logged in and visiting /login, redirect to /dashboard
  if (pathname === '/login' && accessToken) {
    const redirectUrl = request.nextUrl.searchParams.get('redirectUrl') || '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Add no-store headers for protected routes
  const response = NextResponse.next();
  if (isProtectedPath) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/notifications/:path*',
    '/templates/:path*',
    '/providers/:path*',
    '/logs/:path*',
    '/test-send/:path*',
    '/login'
  ]
};
