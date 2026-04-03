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
  // Check if it's a dashboard route (with or without locale prefix)
  const isDashboard = req.nextUrl.pathname.match(/\/(hi|en|gu|mr|bn|ta|te)\/dashboard/) || 
                      req.nextUrl.pathname.startsWith('/dashboard');
  
  if (isDashboard) {
    return (authMiddleware as NextMiddlewareWithAuth)(req as unknown as NextRequestWithAuth, {} as NextFetchEvent);
  }
  
  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(hi|en|gu|mr|bn|ta|te)/:path*']
};
