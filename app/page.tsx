import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-wrapper">

      {/* ── NAVBAR ── */}
      <nav style={{ borderBottom: "1px solid #14532d" }}
        className="sticky top-0 z-50 bg-gw-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gw-400 to-lime-400
                            flex items-center justify-center text-lg">
              🌿
            </div>
            <span className="font-black text-xl text-white">GreenWheels</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-semibold text-gw-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="section text-center py-24">
        <div className="inline-flex items-center gap-2 badge-green mb-6">
          <span>🇮🇳</span>
          <span>India&apos;s First Verified EV Retrofit Platform</span>
        </div>
        <h1 className="font-black text-5xl md:text-7xl text-white leading-tight mb-6">
          Convert Your Vehicle
          <span className="block text-transparent bg-clip-text
                           bg-gradient-to-r from-gw-400 to-lime-400">
            Go Electric
          </span>
        </h1>
        <p className="text-gw-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop paying ₹15–25 lakh for a new EV. Convert your existing
          vehicle to electric for a fraction of the cost — through
          admin-verified, trusted dealers only.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/retrofit" className="btn-primary text-base py-4 px-8">
            Start Retrofit Inquiry →
          </Link>
          <Link href="/legal" className="btn-secondary text-base py-4 px-8">
            How It Works
          </Link>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: "1px solid #14532d", borderBottom: "1px solid #14532d" }}
        className="bg-gw-900">
        <div className="max-w-6xl mx-auto px-4 py-8
                        grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "₹2–5L",  label: "Average Retrofit Cost" },
            { value: "100+",   label: "Verified Dealers" },
            { value: "12 Phases", label: "Transparent Order Flow" },
            { value: "100%",   label: "Legal RTO Compliant" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-black text-3xl text-lime-400 mb-1">{s.value}</div>
              <div className="text-sm text-gw-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="text-center mb-14">
          <div className="badge-green inline-block mb-4">Simple 4-Step Process</div>
          <h2 className="font-black text-4xl text-white">How GreenWheels Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: "📋", title: "Submit Inquiry",
              desc: "Fill our multi-step form with vehicle details, photos, and ownership proof." },
            { step: "02", icon: "🔍", title: "On-Site Verification",
              desc: "Dealer sends a verifier to your location to inspect the vehicle before any payment." },
            { step: "03", icon: "💳", title: "Pay 30% Token",
              desc: "Only after verification passes — pay a small token to confirm your booking." },
            { step: "04", icon: "⚡", title: "Get Retrofitted",
              desc: "Dealer picks up, converts, and delivers your electric vehicle back to you." },
          ].map((s) => (
            <div key={s.step} className="card relative">
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="absolute top-4 right-4 text-xs font-black text-gw-800">
                {s.step}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
              <p className="text-gw-300 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY GREENWHEELS ── */}
      <section style={{ borderTop: "1px solid #14532d" }} className="section">
        <div className="text-center mb-14">
          <h2 className="font-black text-4xl text-white">Why GreenWheels?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🛡️", title: "Admin Verified Dealers",
              desc: "Every dealer is manually approved by our admin before they can accept any order. No unverified mechanics ever." },
            { icon: "🔍", title: "On-Site Inspection First",
              desc: "We send a verifier to your location before pickup. Your vehicle is checked for safety and eligibility before any money changes hands." },
            { icon: "💰", title: "Pay Only After Verification",
              desc: "Token payment happens only after your vehicle passes on-site inspection. Verification fails? Zero rupees lost." },
            { icon: "📍", title: "Full Transparency",
              desc: "Track every phase of your order — from inquiry to delivery — in real time. 12 clear phases, no surprises." },
            { icon: "⚖️", title: "100% Legal Process",
              desc: "We guide you through the full RTO approval process. Your converted vehicle will be completely road legal." },
            { icon: "📄", title: "Auto Generated Bill",
              desc: "After final payment, a detailed invoice is auto-generated and saved permanently in your account — downloadable any time." },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gw-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VEHICLE TYPES ── */}
      <section style={{ borderTop: "1px solid #14532d" }} className="section">
        <div className="text-center mb-14">
          <h2 className="font-black text-4xl text-white">We Retrofit All Vehicle Types</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🚗", type: "Car",           desc: "Hatchbacks, sedans, SUVs — Pure Electric or Hybrid" },
            { icon: "🏍️", type: "Bike",          desc: "Motorcycles and scooters — Pure Electric conversion" },
            { icon: "🛺", type: "Auto-Rickshaw", desc: "Three-wheelers — most popular retrofit in India" },
          ].map((v) => (
            <div key={v.type}
              style={{ border: "1px solid #14532d" }}
              className="bg-gw-900 rounded-2xl p-8 text-center
                         hover:border-gw-600 transition-all duration-200">
              <div className="text-6xl mb-4">{v.icon}</div>
              <h3 className="font-black text-2xl text-white mb-2">{v.type}</h3>
              <p className="text-gw-300 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: "1px solid #14532d" }}
        className="section text-center py-20">
        <h2 className="font-black text-4xl md:text-5xl text-white mb-4">
          Ready to Go Electric?
        </h2>
        <p className="text-gw-300 text-lg max-w-xl mx-auto mb-8">
          Join thousands of vehicle owners converting to clean energy.
          Start your inquiry today — completely free until verification passes.
        </p>
        <Link href="/retrofit" className="btn-primary text-lg py-4 px-10">
          Start Your Retrofit Inquiry →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #14532d" }}
        className="bg-gw-900 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center
                          justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br
                              from-gw-400 to-lime-400
                              flex items-center justify-center text-sm">
                🌿
              </div>
              <span className="font-black text-white">GreenWheels</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gw-400">
              <Link href="/legal"     className="hover:text-white transition-colors">Legal Info</Link>
              <Link href="/franchise" className="hover:text-white transition-colors">Franchise</Link>
              <Link href="/login"     className="hover:text-white transition-colors">Login</Link>
              <Link href="/register"  className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="text-center text-xs text-gw-700 mt-8">
            © 2026 GreenWheels. All rights reserved. Making India electric, one vehicle at a time.
          </div>
        </div>
      </footer>

    </main>
  );
}