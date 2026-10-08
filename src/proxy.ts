import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Overwrite any client-supplied value. Session and role checks remain server-side.
  headers.set('x-libtech-path', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: [
    '/dashboard',
    '/profile',
    '/certificates',
    '/learn/:path*',
    '/checkout/:path*',
    '/admin/:path*',
  ],
};
