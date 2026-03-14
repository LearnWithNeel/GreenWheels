import Link from "next/link";

export default function DealerDashboardPage() {
  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="badge-green inline-block mb-4">
            Dealer Dashboard
          </div>
          <h1 className="font-black text-3xl text-white mb-4">
            Welcome to Your Workshop Panel 🔧
          </h1>
          <p className="text-gw-400 text-sm">
            Your full dashboard is coming in Week 8.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: "📋", label: "New Orders",       value: "0", desc: "Pending acceptance" },
            { icon: "🔧", label: "Active Jobs",      value: "0", desc: "In progress" },
            { icon: "✅", label: "Completed",         value: "0", desc: "Total jobs done" },
            { icon: "⭐", label: "Rating",            value: "—", desc: "Avg customer rating" },
            { icon: "💰", label: "Total Earnings",   value: "₹0", desc: "Lifetime earnings" },
            { icon: "🛡️", label: "Profile Status",   value: "Pending", desc: "Admin approval" },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-black text-2xl text-white mb-1">
                {s.value}
              </div>
              <div className="font-bold text-gw-300 text-sm mb-1">
                {s.label}
              </div>
              <div className="text-gw-600 text-xs">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="card text-center">
          <p className="text-gw-400 text-sm mb-4">
            Complete your profile so admin can review and approve
            your workshop for customer visibility.
          </p>
          <Link href="/dealer/profile" className="btn-primary">
            Complete My Profile →
          </Link>
        </div>

      </section>
    </main>
  );
}