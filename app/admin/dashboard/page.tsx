import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="badge-green inline-block mb-4">Admin Panel</div>
          <h1 className="font-black text-3xl text-white mb-2">
            GreenWheels Admin Dashboard 🛡️
          </h1>
          <p className="text-gw-400 text-sm">
            Manage dealers, orders and customers from here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🔧", label: "Dealer Management",
              desc:  "Review and approve dealer profiles",
              href:  "/admin/dealers" },
            { icon: "📋", label: "Order Management",
              desc:  "Track all retrofit orders",
              href:  "/admin/orders" },
            { icon: "👥", label: "Customer Management",
              desc:  "View all registered customers",
              href:  "/admin/customers" },
            { icon: "🏪", label: "Franchise Interests",
              desc:  "View franchise interest submissions",
              href:  "/admin/franchise" },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="card hover:border-lime-700/50 transition-all
                         flex items-start gap-4 group">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-black text-white text-lg mb-1
                               group-hover:text-lime-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-gw-400 text-sm">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </section>
    </main>
  );
}