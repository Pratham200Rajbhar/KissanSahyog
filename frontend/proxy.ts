import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextFetchEvent, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  }
);

export default async function proxy(req: NextRequest) {
  const publicPages = ["/", "/api/auth/.*"];

  const isPublicPage = publicPages.some((path) => {
    const localePattern = `^/(${routing.locales.join("|")})?`;
    const fullPattern = new RegExp(`${localePattern}${path === "/" ? "(/)?$" : path}`);
    return fullPattern.test(req.nextUrl.pathname);
  });

  if (isPublicPage) {
    const isRootPath = req.nextUrl.pathname === "/" || routing.locales.some((locale) => req.nextUrl.pathname === `/${locale}`);

    if (isRootPath) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        const locale = routing.locales.find((l) => req.nextUrl.pathname.startsWith(`/${l}`)) || "en";
        const url = new URL(`/${locale}/dashboard`, req.url);
        return NextResponse.redirect(url);
      }
    }

    return intlMiddleware(req);
  }

  return authMiddleware(req as NextRequestWithAuth, {} as NextFetchEvent);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};