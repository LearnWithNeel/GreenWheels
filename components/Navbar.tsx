"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = (session?.user as { role?: string })?.role;

  function getDashboardLink() {
    if (role === "admin")  return "/admin/dashboard";
    if (role === "dealer") return "/dealer/dashboard";
    return "/dashboard";
  }

  return (
    <nav style={{ borderBottom: "1px solid #14532d" }}
      className="sticky top-0 z-50 bg-gw-950/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gw-400 to-lime-400
                          flex items-center justify-center text-lg">
            🌿
          </div>
          <span className="font-black text-xl text-white">GreenWheels</span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/retrofit"  className="text-gw-400 hover:text-white transition-colors">
            Retrofit
          </Link>
          <Link href="/shop"      className="text-gw-400 hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/legal"     className="text-gw-400 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/franchise" className="text-gw-400 hover:text-white transition-colors">
            Franchise
          </Link>
        </div>

        {/* ── Desktop Auth ── */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href={getDashboardLink()}
                className="text-sm font-semibold text-gw-400 hover:text-white transition-colors">
                👋 {session.user?.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary text-sm py-2 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-semibold text-gw-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden text-gw-400 hover:text-white transition-colors text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid #14532d" }}
          className="md:hidden bg-gw-950 px-4 py-4 flex flex-col gap-4">
          <Link href="/retrofit"  className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>Retrofit</Link>
          <Link href="/shop"      className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/legal"     className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/franchise" className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>Franchise</Link>

          <div style={{ borderTop: "1px solid #14532d" }} className="pt-4">
            {session ? (
              <>
                <Link href={getDashboardLink()}
                  className="block text-gw-400 hover:text-white text-sm font-medium mb-3"
                  onClick={() => setMenuOpen(false)}>
                  👋 {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-secondary w-full text-sm py-2">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" className="btn-secondary w-full text-sm py-2 text-center"
                  onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="btn-primary w-full text-sm py-2 text-center"
                  onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}