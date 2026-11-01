import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const host = req.headers.get('host') || '';

    const dashboardUrl = process.env.NEXTAUTH_URL!;
    const dashboardHost = new URL(dashboardUrl).host;

    if (pathname === '/' && host === dashboardHost) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (pathname.startsWith('/auth')) {
      return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (pathname.startsWith('/admin')) {
      if (!token?.user?.permissions?.includes('dashboardAccess')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*', '/auth/:path*', '/'],
};
