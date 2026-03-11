import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Protected routes per role ────────────────────────────────────────────────
// Week 3 — we will add real auth checks here
// For now this lets everything through so we can test pages freely

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/retrofit/:path*",
    "/transactions/:path*",
    "/dealer/:path*",
    "/admin/:path*",
  ],
};