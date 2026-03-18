"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = (session?.user as { role?: string })?.role;

  function getDashboardLink() {
    if (role === "admin") return "/admin/dashboard";
    if (role === "dealer") return "/dealer/dashboard";
    return "/dashboard";
  }

  const navLinks = role === "dealer" ? [
    { href: "/dealer/dashboard", label: "My Orders" },
    { href: "/dealer/profile", label: "Workshop" },
    { href: "/shop", label: "Shop" },
    { href: "/how-it-works", label: "How It Works" },
  ] : role === "admin" ? [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/dealers", label: "Dealers" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/franchise", label: "Franchise" },
  ] : [
    { href: "/retrofit", label: "Retrofit" },
    { href: "/shop", label: "Shop" },
    { href: "/how-it-works", label: "How It Works" },
    ...(!session ? [{ href: "/franchise", label: "Franchise" }] : []),
  ];

  const accountLinks = [
    { href: getDashboardLink(), icon: "📊", label: "Dashboard", sublabel: "Overview & stats" },
    { href: role === "dealer" ? "/dealer/profile" : "/profile", icon: "👤", label: "Profile", sublabel: role === "dealer" ? "Workshop settings" : "Account settings" },
    { href: role === "dealer" ? "/dealer/orders" : "/orders", icon: "📋", label: "My Orders", sublabel: "Active & history" },
  ];

  return (
    <>
      <nav style={{ borderBottom: "1px solid #14532d" }}
        className="sticky top-0 z-50 bg-gw-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Logo */}
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
            <span id="navbar-logo-text" className="font-black text-xl text-white">GreenWheels</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-gw-400 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <NotificationBell />
                <div className="relative">
                  {/* Trigger button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      border: dropdownOpen ? "1px solid #a3e635" : "1px solid #14532d",
                      background: dropdownOpen ? "#0a2a0a" : "#052e16",
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:border-lime-400">
                    {/* Static conic ring — no rotation on button */}
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: "conic-gradient(#a3e635 0deg,#4ade80 120deg,#14532d 240deg,#a3e635 360deg)",
                      padding: "2px",
                    }}>
                      <div style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        background: "#021a0e", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "12px", fontWeight: 900, color: "#a3e635",
                      }}>
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-white text-sm font-bold">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#4ade80" strokeWidth="1.5"
                      style={{ transition: "transform .3s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <path d="M2 3l3 4 3-4" />
                    </svg>
                  </button>

                  {/* Backdrop */}
                  {dropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />}

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: "290px", zIndex: 20, animation: "ddIn .35s cubic-bezier(.34,1.4,.64,1)" }}>
                      {/* Glow border */}
                      <div style={{ position: "relative", borderRadius: "22px", padding: "1px", background: "linear-gradient(135deg,#a3e63540,#14532d80,#a3e63520)" }}>
                        <div style={{ background: "#021a0e", borderRadius: "20px", overflow: "hidden" }}>

                          {/* Rainbow top line */}
                          <div style={{ height: "3px", background: "linear-gradient(90deg,#052e16,#a3e635,#4ade80,#052e16)" }} />

                          {/* User banner */}
                          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", background: "#031207", borderBottom: "1px solid #0d2d0d", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: "-20px", right: "-10px", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle,#a3e63510,transparent 70%)", animation: "orb 3s ease-in-out infinite" }} />
                            <div style={{ position: "absolute", bottom: "-20px", right: "30px", width: "55px", height: "55px", borderRadius: "50%", background: "radial-gradient(circle,#4ade8010,transparent 70%)", animation: "orb 3s ease-in-out infinite 1.5s" }} />
                            {/* Spinning avatar — only inside dropdown */}
                            <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
                              <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "conic-gradient(#a3e635 0%,#4ade80 30%,#14532d 60%,#052e16 80%,#a3e635 100%)", padding: "2.5px", animation: "spinRing 8s linear infinite" }}>
                                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#021a0e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: "#a3e635" }}>
                                  {session.user?.name?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "11px", height: "11px", background: "#a3e635", borderRadius: "50%", border: "2px solid #021a0e" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                              <p style={{ color: "#fff", fontWeight: 900, fontSize: "14px", marginBottom: "2px" }}>{session.user?.name}</p>
                              <p style={{ color: "#2d6b3d", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px", marginBottom: "7px" }}>{session.user?.email}</p>
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: "#a3e63512", border: "1px solid #a3e63535", color: "#a3e635" }}>
                                {role === "dealer" ? "🔧 Dealer" : role === "admin" ? "🛡️ Admin" : "👤 Customer"}
                              </span>
                            </div>
                          </div>

                          {/* Section label */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px 4px" }}>
                            <div style={{ flex: 1, height: "1px", background: "#0d2d0d" }} />
                            <span style={{ color: "#1a4d1a", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" }}>NAVIGATE</span>
                            <div style={{ flex: 1, height: "1px", background: "#0d2d0d" }} />
                          </div>

                          {/* Links */}
                          <div style={{ padding: "4px 8px 6px" }}>
                            {accountLinks.map(item => (
                              <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="dd-item">
                                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#031207", border: "1px solid #0d2a0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <p className="dil" style={{ color: "#c8e8c8", fontSize: "13px", fontWeight: 700, lineHeight: 1, marginBottom: "3px", transition: "color .15s" }}>{item.label}</p>
                                  <p style={{ color: "#2d6b3d", fontSize: "11px", lineHeight: 1 }}>{item.sublabel}</p>
                                </div>
                                <span className="dia" style={{ color: "#a3e635", fontSize: "16px", opacity: 0, transform: "translateX(-5px)", transition: "all .15s" }}>›</span>
                              </Link>
                            ))}
                          </div>

                          <div style={{ borderTop: "1px solid #0a1f0a", margin: "2px 10px 6px" }} />

                          {/* Logout */}
                          <div style={{ padding: "0 8px 4px" }}>
                            <button onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }} className="dd-logout">
                              <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#130303", border: "1px solid #2d050550", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>🚪</div>
                              <span className="dll" style={{ color: "#ef4444", fontSize: "13px", fontWeight: 700, transition: "color .2s" }}>Logout</span>
                            </button>
                          </div>

                          {/* Footer */}
                          <div style={{ background: "#010f07", borderTop: "1px solid #0a1f0a", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a3e635", animation: "blink 2s ease-in-out infinite" }} />
                              <span style={{ color: "#1a4d1a", fontSize: "10px" }}>All systems operational</span>
                            </div>
                            <span style={{ color: "#14532d", fontSize: "11px", fontWeight: 900 }}>🌿 GreenWheels</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/dealer/register" className="text-sm font-semibold text-gw-400 hover:text-white transition-colors">Become a Dealer</Link>
                <Link href="/login" className="text-sm font-semibold text-gw-400 hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center gap-3">
            {session && !menuOpen && <NotificationBell />}
            <button className="text-gw-400 hover:text-white transition-colors text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Backdrop */}
      <div onClick={() => setMenuOpen(false)}
        className="fixed inset-0 z-40 bg-black/70 md:hidden transition-opacity duration-300"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
      />

      {/* Mobile Slide Panel */}
      <div style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform .4s cubic-bezier(.4,0,.2,1)" }}
        className="fixed top-0 right-0 h-full w-[280px] z-50 flex flex-col md:hidden shadow-2xl shadow-black">

        {/* Rainbow top line */}
        <div style={{ height: "3px", background: "linear-gradient(90deg,#052e16,#a3e635,#4ade80,#052e16)", flexShrink: 0 }} />

        {/* Panel wrapper */}
        <div style={{ flex: 1, background: "#021a0e", borderLeft: "1px solid #14532d", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Top bar — bell + name + close */}
          <div style={{ borderBottom: "1px solid #0d2d0d", background: "#031207", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Spinning avatar — only inside dropdown */}
              {session && (
                <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "conic-gradient(#a3e635 0%,#4ade80 30%,#14532d 60%,#052e16 80%,#a3e635 100%)", padding: "2.5px", animation: "spinRing 8s linear infinite" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#021a0e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 900, color: "#a3e635" }}>
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "9px", height: "9px", background: "#a3e635", borderRadius: "50%", border: "2px solid #021a0e" }} />
                </div>
              )}
              {session ? (
                <div>
                  <p style={{ color: "#2d6b3d", fontSize: "11px", lineHeight: 1, marginBottom: "3px" }}>Welcome back</p>
                  <p style={{ color: "#fff", fontWeight: 900, fontSize: "14px", lineHeight: 1 }}>{session.user?.name?.split(" ")[0]} 👋</p>
                </div>
              ) : (
                <p style={{ color: "#fff", fontWeight: 900, fontSize: "14px" }}>Menu</p>
              )}
            </div>
            <button onClick={() => setMenuOpen(false)}
              style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#052e16", border: "1px solid #14532d", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", fontSize: "14px", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>

            {/* Navigate */}
            <p style={{ color: "#1a4d1a", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px 6px" }}>NAVIGATE</p>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="dd-item">
                <div style={{ flex: 1 }}>
                  <p className="dil" style={{ color: "#c8e8c8", fontSize: "13px", fontWeight: 700, lineHeight: 1, transition: "color .15s" }}>{link.label}</p>
                </div>
                <span className="dia" style={{ color: "#a3e635", fontSize: "16px", opacity: 0, transform: "translateX(-5px)", transition: "all .15s" }}>›</span>
              </Link>
            ))}

            {/* My Account */}
            {session && (
              <>
                <div style={{ borderTop: "1px solid #0a1f0a", margin: "8px 2px" }} />
                <p style={{ color: "#1a4d1a", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px 6px" }}>MY ACCOUNT</p>
                {accountLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="dd-item">
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#031207", border: "1px solid #0d2a0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>{link.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p className="dil" style={{ color: "#c8e8c8", fontSize: "13px", fontWeight: 700, lineHeight: 1, marginBottom: "3px", transition: "color .15s" }}>{link.label}</p>
                      <p style={{ color: "#2d6b3d", fontSize: "11px", lineHeight: 1 }}>{link.sublabel}</p>
                    </div>
                    <span className="dia" style={{ color: "#a3e635", fontSize: "16px", opacity: 0, transform: "translateX(-5px)", transition: "all .15s" }}>›</span>
                  </Link>
                ))}
              </>
            )}

            {/* Become dealer — guest only */}
            {!session && (
              <>
                <div style={{ borderTop: "1px solid #0a1f0a", margin: "8px 2px" }} />
                <Link href="/dealer/register" onClick={() => setMenuOpen(false)} className="dd-item">
                  <span style={{ color: "#a3e635", fontSize: "13px", fontWeight: 700 }}>🔧 Become a Dealer</span>
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #0a1f0a", background: "#010f07", padding: "12px 16px", flexShrink: 0 }}>
            {session ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a3e635", animation: "blink 2s ease-in-out infinite" }} />
                    <span style={{ color: "#1a4d1a", fontSize: "10px" }}>All systems operational</span>
                  </div>
                  <span style={{ color: "#14532d", fontSize: "11px", fontWeight: 900 }}>🌿 GreenWheels</span>
                </div>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="dd-logout" style={{ width: "100%" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#130303", border: "1px solid #2d050550", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🚪</div>
                  <span className="dll" style={{ color: "#ef4444", fontSize: "13px", fontWeight: 700, transition: "color .2s" }}>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full text-sm py-3 text-center">Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary  w-full text-sm py-3 text-center">Get Started</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}