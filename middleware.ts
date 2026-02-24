import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // 管理者ルート: adminロール必須
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/?adminDenied=1', request.url));
    }
    return NextResponse.next();
  }

  // 保護されたルート
  const protectedRoutes = ['/dashboard', '/profile', '/diagnosis'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/diagnosis/:path*', '/admin/:path*'],
};
