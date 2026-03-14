import Link from "next/link";

export default function HowItWorksPage() {
  const STEPS = [
    { phase: "01", title: "Submit Inquiry",        icon: "📋", desc: "Fill our 8-step retrofit inquiry form with your vehicle details, photos, and preferences. Free to submit — no payment needed." },
    { phase: "02", title: "Dealer Notified",       icon: "🔧", desc: "Our admin-verified dealers in your area are notified of your inquiry and can accept your order." },
    { phase: "03", title: "Choose Your Dealer",    icon: "⭐", desc: "Review dealer profiles, ratings, and experience. Pick the dealer you trust most for your vehicle." },
    { phase: "04", title: "On-Site Verification",  icon: "🔍", desc: "Dealer visits your location to physically inspect your vehicle. Verification is done at your doorstep." },
    { phase: "05", title: "Verification Result",   icon: "✅", desc: "If your vehicle passes verification — great! If not — zero rupees are charged. No risk to you." },
    { phase: "06", title: "Pay Token Amount",      icon: "💰", desc: "Only after verification passes — pay 30% token to confirm your order. 100% refundable if order is cancelled before pickup." },
    { phase: "07", title: "Vehicle Pickup",        icon: "🚗", desc: "Dealer picks up your vehicle from your location on the confirmed date." },
    { phase: "08", title: "Retrofit Work",         icon: "⚡", desc: "Your vehicle is retrofitted with ARAI-approved EV kit at the dealer's certified workshop." },
    { phase: "09", title: "Quality Check",         icon: "🛡️", desc: "After retrofit — thorough quality and safety check is performed on your converted vehicle." },
    { phase: "10", title: "RTO & Form 22C",        icon: "📄", desc: "Dealer handles all RTO paperwork including Form 22C filing for your retrofitted vehicle." },
    { phase: "11", title: "Final Payment",         icon: "✅", desc: "Pay remaining 70% only after you receive your vehicle and are satisfied with the work." },
    { phase: "12", title: "Vehicle Delivered",     icon: "🎉", desc: "Your EV-converted vehicle is delivered back to your doorstep with all documents and warranty." },
  ];

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="badge-green inline-block mb-4">How It Works</div>
          <h1 className="font-black text-4xl text-white mb-4">
            12-Phase Transparent Process
          </h1>
          <p className="text-gw-400 text-lg max-w-2xl mx-auto">
            Every GreenWheels retrofit follows a strict 12-phase process
            designed to protect you at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {STEPS.map((s) => (
            <div key={s.phase} className="card flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-lime-400/10
                              border border-lime-700/50 flex items-center
                              justify-center text-lg">
                {s.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lime-400 text-xs font-black">
                    Phase {s.phase}
                  </span>
                </div>
                <h3 className="font-black text-white text-sm mb-1">
                  {s.title}
                </h3>
                <p className="text-gw-400 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Promise */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-2xl p-6 text-center mb-8">
          <h2 className="font-black text-2xl text-white mb-3">
            Our Core Promise 🛡️
          </h2>
          <p className="text-gw-300 text-sm leading-relaxed max-w-xl mx-auto">
            Payment is collected <strong className="text-white">
            only after verification passes</strong>. If your vehicle
            fails verification — your order is cancelled and
            <strong className="text-white"> zero rupees are charged</strong>.
            No risk. No hidden charges. No surprises.
          </p>
        </div>

        <div className="text-center">
          <Link href="/retrofit" className="btn-primary text-base py-4 px-8">
            Start My EV Conversion →
          </Link>
        </div>

      </section>
    </main>
  );
}