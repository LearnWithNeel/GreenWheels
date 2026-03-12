import Link from "next/link";

export default function FranchisePage() {
  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto text-center">

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 badge-green mb-6">
          <span>🚀</span>
          <span>Coming Soon</span>
        </div>

        {/* Heading */}
        <h1 className="font-black text-4xl md:text-6xl text-white leading-tight mb-6">
          Own a GreenWheels
          <span className="block text-transparent bg-clip-text
                           bg-gradient-to-r from-gw-400 to-lime-400">
            Franchise
          </span>
        </h1>

        <p className="text-gw-300 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          We are building India's largest verified EV retrofit network.
          Soon you will be able to apply for a GreenWheels franchise in
          your city and become part of the green revolution.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { icon: "🏪", title: "Your Own Business",
              desc: "Run a verified GreenWheels dealer centre in your city with full platform support." },
            { icon: "📱", title: "Full Platform Access",
              desc: "Get listed on GreenWheels, receive orders directly, manage everything from your dashboard." },
            { icon: "💰", title: "Earn on Every Order",
              desc: "Keep 90% of every order value. Only 10% platform commission — one of the lowest in industry." },
            { icon: "🛡️", title: "Admin Verified Badge",
              desc: "Get the GreenWheels Verified badge — builds instant trust with customers in your area." },
            { icon: "📋", title: "Legal & RTO Support",
              desc: "We guide you through all ARAI kit approvals, Form 22C filings, and RTO paperwork." },
            { icon: "🌿", title: "Be Part of the Movement",
              desc: "Join India's EV revolution. Help thousands of vehicle owners go electric affordably." },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gw-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Notify Form */}
        <div className="card max-w-md mx-auto">
          <h2 className="font-black text-xl text-white mb-2">
            Get Notified When We Launch
          </h2>
          <p className="text-gw-400 text-sm mb-6">
            Leave your email and we will reach out to you first when
            franchise applications open in your city.
          </p>
          <div className="flex flex-col gap-3">
            <input
              className="input"
              type="text"
              placeholder="Your Full Name"
              disabled
            />
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              disabled
            />
            <input
              className="input"
              type="text"
              placeholder="Your City"
              disabled
            />
            <button
              disabled
              className="btn-primary w-full opacity-60 cursor-not-allowed">
              Notify Me When Available
            </button>
          </div>
          <p className="text-gw-700 text-xs mt-4">
            Form will be enabled when franchise programme launches.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-10">
          <Link href="/" className="text-gw-400 hover:text-white
                                    transition-colors text-sm font-medium">
            ← Back to Home
          </Link>
        </div>

      </section>
    </main>
  );
}