import { withAuth, NextMiddlewareWithAuth, NextRequestWithAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextFetchEvent } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = withAuth(
  (req) => intlMiddleware(req),
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Check if it's a dashboard route
  // Locale-prefixed dashboard: /en/dashboard, /hi/dashboard, etc.
  // Non-prefixed dashboard: /dashboard
  const isDashboard = pathname.match(/\/(hi|en|gu)\/dashboard/) || 
                      pathname === '/dashboard' || 
                      pathname.startsWith('/dashboard/');
  
  if (isDashboard) {
    // For dashboard, we apply auth first, then intl
    return (authMiddleware as NextMiddlewareWithAuth)(req as unknown as NextRequestWithAuth, {} as NextFetchEvent);
  }
  
  // 2. For all other routes, just apply intl (this handles the redirect from / to /en etc)
  return intlMiddleware(req);
}

export const config = {
  // Matcher for internationalized routes
  // This matches all routes EXCEPT _next, _vercel, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
