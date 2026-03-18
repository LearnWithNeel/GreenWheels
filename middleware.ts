import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { verify } from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const role = (token as { role?: string } | null)?.role;

  // ── Support Portal — uses separate JWT cookie ──────────────────────────
  if (pathname.startsWith("/support-portal") &&
      pathname !== "/support-portal/login") {
    const supportToken = request.cookies.get("support-token")?.value;
    if (!supportToken) {
      return NextResponse.redirect(
        new URL("/support-portal/login", request.url)
      );
    }
    try {
      verify(supportToken, process.env.NEXTAUTH_SECRET || "secret");
    } catch {
      return NextResponse.redirect(
        new URL("/support-portal/login", request.url)
      );
    }
    return NextResponse.next();
  }

  // ── Already logged in — redirect away from auth pages ──────────────────
  if (token && (pathname === "/login" || pathname === "/register")) {
    if (role === "admin")  return NextResponse.redirect(new URL("/admin/dashboard",  request.url));
    if (role === "dealer") return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Customer routes ─────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/orders")    ||
      pathname.startsWith("/retrofit/track")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "customer") return NextResponse.redirect(new URL("/", request.url));
  }

  // ── Profile — customer + dealer ─────────────────────────────────────────
  if (pathname.startsWith("/profile")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Dealer routes ───────────────────────────────────────────────────────
  if (pathname.startsWith("/dealer") &&
      pathname !== "/dealer/register") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "dealer") return NextResponse.redirect(new URL("/", request.url));
  }

  // ── Admin routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") &&
      pathname !== "/admin/login") {
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/retrofit/track/:path*",
    "/dealer/:path*",
    "/admin/:path*",
    "/support-portal/:path*",
    "/login",
    "/register",
  ],
};