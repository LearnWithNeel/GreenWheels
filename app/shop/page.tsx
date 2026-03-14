import Link from "next/link";

const CATEGORIES = [
  { icon: "⚡", title: "EV Conversion Kits",
    desc: "ARAI approved retrofit kits for cars, bikes and autos." },
  { icon: "🔋", title: "Batteries",
    desc: "Lithium-ion battery packs for all vehicle types." },
  { icon: "🔧", title: "Motors & Controllers",
    desc: "High efficiency motors and motor controllers." },
  { icon: "🔌", title: "Chargers & Cables",
    desc: "Home chargers, fast chargers, and charging cables." },
  { icon: "🛡️", title: "Safety Equipment",
    desc: "BMS units, fuses, contactors and safety gear." },
  { icon: "🚗", title: "New Electric Vehicles",
    desc: "Browse new EVs from verified manufacturers." },
];

export default function ShopPage() {
  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <div className="badge-green inline-block mb-4">Shop</div>
          <h1 className="font-black text-4xl text-white mb-4">
            EV Parts & Accessories
          </h1>
          <p className="text-gw-400 text-lg max-w-2xl mx-auto">
            Browse our curated collection of EV components,
            accessories and new electric vehicles.
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-2xl p-8 text-center mb-12">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="font-black text-2xl text-white mb-2">
            Shop Launching Soon
          </h2>
          <p className="text-gw-400 text-sm max-w-lg mx-auto">
            Our verified EV parts store is being set up with
            quality-checked products from certified suppliers.
          </p>
        </div>

        {/* Category Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {CATEGORIES.map(c => (
            <div key={c.title} className="card opacity-60">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-black text-white text-lg mb-1">
                {c.title}
              </h3>
              <p className="text-gw-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/retrofit" className="btn-primary text-base py-4 px-8">
            Start EV Retrofit Instead →
          </Link>
        </div>

      </section>
    </main>
  );
}