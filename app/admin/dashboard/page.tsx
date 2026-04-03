"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

type Stats = {
  customers:  { total: number };
  dealers:    { total: number; approved: number; pending: number };
  vendors:    { total: number; pending: number };
  orders:     { total: number; active: number; completed: number; cancelled: number };
  complaints: { total: number; open: number; escalated: number };
};

type RecentOrder = {
  _id:         string;
  orderNumber: string;
  status:      string;
  createdAt:   string;
  customer:    { name: string; email: string };
  vehicle:     { brand: string; model: string; type: string };
};

export default function AdminDashboardPage() {
  const [stats, setStats]               = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const res  = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        <div className="mb-8">
          <div className="badge-green inline-block mb-3">Admin Panel</div>
          <div className="flex items-center justify-between">
            <h1 className="font-black text-3xl text-white">
              Platform Overview 🛡️
            </h1>
            <button onClick={loadStats}
              className="btn-secondary text-sm py-2 px-4">
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading stats...</p>
        ) : (
          <>
            {/* Alert banners */}
            {stats && (stats.dealers.pending > 0 ||
              stats.vendors.pending > 0 ||
              stats.complaints.escalated > 0) && (
              <div className="flex flex-col gap-2 mb-6">
                {stats.dealers.pending > 0 && (
                  <Link href="/admin/dealers"
                    style={{ border: "1px solid #d97706" }}
                    className="bg-yellow-900/20 rounded-xl px-4 py-3
                               flex items-center justify-between">
                    <span className="text-yellow-400 text-sm font-bold">
                      ⚠️ {stats.dealers.pending} dealer{stats.dealers.pending > 1 ? "s" : ""} pending approval
                    </span>
                    <span className="text-yellow-400 text-xs">Review →</span>
                  </Link>
                )}
                {stats.vendors.pending > 0 && (
                  <Link href="/admin/vendors"
                    style={{ border: "1px solid #d97706" }}
                    className="bg-yellow-900/20 rounded-xl px-4 py-3
                               flex items-center justify-between">
                    <span className="text-yellow-400 text-sm font-bold">
                      ⚠️ {stats.vendors.pending} vendor{stats.vendors.pending > 1 ? "s" : ""} pending approval
                    </span>
                    <span className="text-yellow-400 text-xs">Review →</span>
                  </Link>
                )}
                {stats.complaints.escalated > 0 && (
                  <Link href="/admin/complaints"
                    style={{ border: "1px solid #991b1b" }}
                    className="bg-red-900/20 rounded-xl px-4 py-3
                               flex items-center justify-between">
                    <span className="text-red-400 text-sm font-bold">
                      🚨 {stats.complaints.escalated} complaint{stats.complaints.escalated > 1 ? "s" : ""} escalated — action required
                    </span>
                    <span className="text-red-400 text-xs">Action →</span>
                  </Link>
                )}
              </div>
            )}

            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: "👥", label: "Customers",    value: stats?.customers.total || 0,  color: "text-white",   href: "/admin/customers" },
                { icon: "🔧", label: "Dealers",      value: stats?.dealers.approved || 0, color: "text-lime-400", href: "/admin/dealers"  },
                { icon: "🏭", label: "Vendors",      value: stats?.vendors.total || 0,    color: "text-white",   href: "/admin/vendors"  },
                { icon: "📋", label: "Total Orders", value: stats?.orders.total || 0,     color: "text-white",   href: "/admin/orders"   },
              ].map(s => (
                <Link key={s.label} href={s.href}
                  className="card text-center hover:border-lime-700/50
                             transition-all group">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className={`font-black text-3xl mb-1 ${s.color}
                    group-hover:text-lime-400 transition-colors`}>
                    {s.value}
                  </div>
                  <div className="text-gw-500 text-xs">{s.label}</div>
                </Link>
              ))}
            </div>

            {/* Order stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: "⚡", label: "Active Orders",    value: stats?.orders.active    || 0, color: "text-yellow-400" },
                { icon: "✅", label: "Completed",         value: stats?.orders.completed || 0, color: "text-lime-400"   },
                { icon: "🚨", label: "Open Complaints",   value: stats?.complaints.open  || 0, color: "text-orange-400" },
                { icon: "🔴", label: "Escalated",         value: stats?.complaints.escalated || 0, color: "text-red-400" },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className={`font-black text-2xl mb-1 ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-gw-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: "🔧", label: "Dealer Management",  desc: "Approve/reject dealers",        href: "/admin/dealers"       },
                { icon: "🏭", label: "Vendor Management",  desc: "Approve/reject vendors",        href: "/admin/vendors"       },
                { icon: "📋", label: "All Orders",         desc: "View all retrofit orders",      href: "/admin/orders"        },
                { icon: "👥", label: "Customers",          desc: "View all customers",            href: "/admin/customers"     },
                { icon: "🚨", label: "Complaints",         desc: "Handle escalated complaints",   href: "/admin/complaints"    },
                { icon: "👤", label: "Support Team",       desc: "Manage support agents",         href: "/admin/support-users" },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="card hover:border-lime-700/50 transition-all
                             flex items-start gap-4 group">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-black text-white text-base mb-1
                                   group-hover:text-lime-400 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-gw-400 text-xs">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent orders */}
            {recentOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white text-xl">
                    Recent Orders
                  </h2>
                  <Link href="/admin/orders"
                    className="text-lime-400 text-sm hover:text-white
                               transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {recentOrders.map(order => (
                    <Link key={order._id}
                      href={`/orders/${order._id}`}
                      className="card hover:border-lime-700/50 transition-all
                                 flex items-center justify-between gap-4 group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm">
                            {order.orderNumber}
                          </span>
                          <OrderStatusBadge status={order.status}/>
                        </div>
                        <p className="text-gw-500 text-xs">
                          {order.customer?.name} ·{" "}
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </p>
                      </div>
                      <span className="text-gw-600 group-hover:text-white
                                       transition-colors text-xs">
                        View →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </section>
    </main>
  );
}