import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/', '/commerce', '/emergency', '/profile', '/admin', '/dashboard', '/resources', '/skills', '/food'];
const PUBLIC_AUTH_PAGES = ['/login', '/auth', '/landing'];

const API_BASE_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

async function isAuthenticated(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });

    return response.ok;
  } catch (_error) {
    return false;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const loggedIn = await isAuthenticated(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });

  const isPublicAuthPage = PUBLIC_AUTH_PAGES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (loggedIn && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!loggedIn && isProtectedRoute) {
    const landingUrl = new URL('/landing', request.url);
    landingUrl.searchParams.set('next', `${pathname}${search || ''}`);
    return NextResponse.redirect(landingUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login/:path*',
    '/auth/:path*',
    '/landing/:path*',
    '/home/:path*',
    '/commerce/:path*',
    '/emergency/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/resources/:path*',
    '/skills/:path*',
    '/food/:path*'
  ],
};
