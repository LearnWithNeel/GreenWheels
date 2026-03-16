"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = (session?.user as { role?: string })?.role;

  function getDashboardLink() {
    if (role === "admin") return "/admin/dashboard";
    if (role === "dealer") return "/dealer/dashboard";
    return "/dashboard";
  }

  return (
    <nav style={{ borderBottom: "1px solid #14532d" }}
      className="sticky top-0 z-50 bg-gw-950/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center
                      justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2">
          <span id="navbar-logo-icon">
            <svg width="36" height="36" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
              <circle cx="250" cy="250" r="250" fill="#052e16" />
              <circle cx="250" cy="130" r="45" fill="#14532d" />
              <circle cx="250" cy="130" r="28" fill="#15803d" />
              <circle cx="250" cy="130" r="16" fill="#a3e635" />
              <path d="M50 285 L130 205 L250 260 L370 195 L450 285 Z" fill="#0f3d1f" />
              <rect x="50" y="285" width="400" height="165" fill="#1a3a1a" />
              <rect x="152" y="300" width="196" height="38" rx="6" fill="#15803d" />
              <path d="M195 300 C198 272 220 259 250 259 C280 259 302 272 305 300 Z" fill="#166534" />
              <circle cx="192" cy="340" r="23" fill="#0a0a0a" />
              <circle cx="192" cy="340" r="13" fill="#a3e635" />
              <circle cx="308" cy="340" r="23" fill="#0a0a0a" />
              <circle cx="308" cy="340" r="13" fill="#a3e635" />
              <polygon points="264,235 236,281 252,281 224,343 272,275 254,275 278,235" fill="#a3e635" />
            </svg>
          </span>
          <span
            id="navbar-logo-text"
            className="font-black text-xl text-white">
            GreenWheels
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/retrofit"
            className="text-gw-400 hover:text-white transition-colors">
            Retrofit
          </Link>
          <Link href="/shop"
            className="text-gw-400 hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/how-it-works"
            className="text-gw-400 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/franchise"
            className="text-gw-400 hover:text-white transition-colors">
            Franchise
          </Link>
        </div>

        {/* ── Desktop Auth ── */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <NotificationBell />
              <Link href={getDashboardLink()}
                className="text-sm font-semibold text-gw-400
                           hover:text-white transition-colors">
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
              <Link href="/dealer/register"
                className="text-sm font-semibold text-gw-400
                           hover:text-white transition-colors">
                Become a Dealer
              </Link>
              <Link href="/login"
                className="text-sm font-semibold text-gw-400
                           hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register"
                className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden text-gw-400 hover:text-white
                     transition-colors text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid #14532d" }}
          className="md:hidden bg-gw-950 px-4 py-4 flex flex-col gap-4">
          <Link href="/retrofit"
            className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>
            Retrofit
          </Link>
          <Link href="/shop"
            className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/how-it-works"
            className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          <Link href="/franchise"
            className="text-gw-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>
            Franchise
          </Link>
          <Link href="/dealer/register"
            className="text-lime-400 hover:text-white text-sm font-medium"
            onClick={() => setMenuOpen(false)}>
            🔧 Become a Dealer
          </Link>

          <div style={{ borderTop: "1px solid #14532d" }} className="pt-4">
            {session ? (
              <>
                <Link href={getDashboardLink()}
                  className="block text-gw-400 hover:text-white
                             text-sm font-medium mb-3"
                  onClick={() => setMenuOpen(false)}>
                  👋 {session.user?.name}
                </Link>
                <Link href="/profile"
                  className="text-sm font-semibold text-gw-400
             hover:text-white transition-colors">
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-secondary w-full text-sm py-2">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login"
                  className="btn-secondary w-full text-sm py-2 text-center"
                  onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register"
                  className="btn-primary w-full text-sm py-2 text-center"
                  onClick={() => setMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}