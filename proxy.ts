import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

const publicPaths = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  if (publicPaths.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  if (!publicPaths.includes(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/today/:path*", "/leads/:path*", "/login"],
};
