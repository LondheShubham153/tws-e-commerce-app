import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromRequest, isAuthenticated } from "./lib/auth/utils";

export async function middleware(request: NextRequest) {
  // Get token and check auth status
  const token = getTokenFromRequest(request);
  const isAuth = token ? await isAuthenticated(request) : null;
  
  // Define protected and auth pages
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");
  const protectedRoutes = ["/checkout", "/profile", "/admin"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If trying to access protected routes without authentication
  if (isProtectedRoute && !isAuth) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If trying to access auth pages while logged in
  if (isAuthPage && isAuth) {
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If trying to access admin pages without admin role
  if (request.nextUrl.pathname.startsWith("/admin") && isAuth?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Add user info to headers if authenticated
  const requestHeaders = new Headers(request.headers);
  if (isAuth) {
    requestHeaders.set("x-user-id", isAuth.userId);
    requestHeaders.set("x-user-role", isAuth.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};
