import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/home', '/commerce', '/profile', '/admin', '/dashboard'];

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth', request.url);
    if (pathname && pathname !== '/auth') {
      loginUrl.searchParams.set('next', `${pathname}${search || ''}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/commerce/:path*', '/profile/:path*', '/admin/:path*', '/dashboard/:path*'],
};
