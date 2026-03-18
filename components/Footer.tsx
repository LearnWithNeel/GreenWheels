import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #14532d" }}
      className="bg-gw-950 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* ── Top Section ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br
                              from-gw-400 to-lime-400 flex items-center
                              justify-center text-lg">
                🌿
              </div>
              <span className="font-black text-xl text-white">
                GreenWheels
              </span>
            </div>
            <p className="text-gw-500 text-sm leading-relaxed mb-4">
              India's first verified EV retrofit marketplace.
              Convert your fuel vehicle to electric — safely,
              legally and transparently.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank"
                className="text-gw-500 hover:text-white transition-colors
                           text-sm">
                Instagram
              </a>
              <span className="text-gw-800">·</span>
              <a href="https://twitter.com" target="_blank"
                className="text-gw-500 hover:text-white transition-colors
                           text-sm">
                Twitter
              </a>
              <span className="text-gw-800">·</span>
              <a href="https://linkedin.com" target="_blank"
                className="text-gw-500 hover:text-white transition-colors
                           text-sm">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-black text-white text-sm mb-4">
              Services
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "EV Retrofit", href: "/retrofit" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Shop EV Parts", href: "/shop" },
                { label: "Franchise", href: "/franchise" },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="text-gw-500 hover:text-white text-sm
                             transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* For Dealers */}
          <div>
            <h4 className="font-black text-white text-sm mb-4">
              For Dealers
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Register as Dealer", href: "/dealer/register" },
                { label: "Dealer Login", href: "/login" },
                { label: "Legal & Compliance", href: "/legal" },
                { label: "Franchise Program", href: "/franchise" },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="text-gw-500 hover:text-white text-sm
                             transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-black text-white text-sm mb-4">
              Legal & Support
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Legal Process", href: "/legal" },
                { label: "State EV Rules", href: "/legal" },
                { label: "Privacy Policy", href: "/legal" },
                { label: "Terms of Service", href: "/legal" },
                { label: "Support & Complaints", href: "/support" },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="text-gw-500 hover:text-white text-sm
                             transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-black text-white text-sm mb-2">
                Contact
              </h4>
              <p className="text-gw-500 text-sm">
                support@greenwheels.in
              </p>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: "1px solid #14532d" }}
          className="pt-6 flex flex-col md:flex-row items-center
                     justify-between gap-4">

          <p className="text-gw-700 text-xs text-center md:text-left">
            © {new Date().getFullYear()} GreenWheels. All rights reserved.
            Made in India 🇮🇳
          </p>

          <div className="flex items-center gap-2">
            <span style={{ border: "1px solid #14532d" }}
              className="text-xs text-gw-500 px-3 py-1 rounded-lg">
              🛡️ Admin Verified Dealers
            </span>
            <span style={{ border: "1px solid #14532d" }}
              className="text-xs text-gw-500 px-3 py-1 rounded-lg">
              ⚡ ARAI Approved Kits
            </span>
            <span style={{ border: "1px solid #14532d" }}
              className="text-xs text-gw-500 px-3 py-1 rounded-lg">
              🔒 Secure Payments
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}