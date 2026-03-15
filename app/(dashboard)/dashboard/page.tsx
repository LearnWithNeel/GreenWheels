"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

type Order = {
  _id:         string;
  orderNumber: string;
  status:      string;
  createdAt:   string;
  vehicle: {
    type:  string;
    brand: string;
    model: string;
    year:  number;
  };
  retrofit: {
    type: string;
  };
};

const VEHICLE_ICONS: Record<string, string> = {
  car:  "🚗",
  bike: "🏍️",
  auto: "🛺",
};

export default function DashboardPage() {
  const { data: session }     = useSession();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const res  = await fetch("/api/orders/my-orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {}
    finally { setLoading(false); }
  }

  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="badge-green inline-block mb-3">My Dashboard</div>
          <h1 className="font-black text-3xl text-white mb-1">
            Welcome back, {name}! 👋
          </h1>
          <p className="text-gw-400 text-sm">
            Track your retrofit orders and manage your account.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon:  "📋",
              label: "Total Orders",
              value: orders.length,
            },
            {
              icon:  "⚡",
              label: "In Progress",
              value: orders.filter(o =>
                !["delivered","cancelled","verification_failed"]
                  .includes(o.status)
              ).length,
            },
            {
              icon:  "✅",
              label: "Completed",
              value: orders.filter(o => o.status === "delivered").length,
            },
            {
              icon:  "🚫",
              label: "Cancelled",
              value: orders.filter(o => o.status === "cancelled").length,
            },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-black text-2xl text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gw-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* New Retrofit CTA */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-2xl p-6 mb-8
                     flex items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-white text-lg mb-1">
              Start a New Retrofit
            </h2>
            <p className="text-gw-400 text-sm">
              Convert another vehicle to electric.
              Free to submit — no payment until verification passes.
            </p>
          </div>
          <Link href="/retrofit"
            className="btn-primary shrink-0 text-sm py-3 px-6">
            Start Retrofit →
          </Link>
        </div>

        {/* Orders List */}
        <div>
          <h2 className="font-black text-white text-xl mb-4">
            My Orders
          </h2>

          {loading ? (
            <div className="card text-center py-8">
              <p className="text-gw-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-black text-white text-lg mb-2">
                No orders yet
              </h3>
              <p className="text-gw-400 text-sm mb-6">
                Submit your first retrofit inquiry to get started.
              </p>
              <Link href="/retrofit" className="btn-primary">
                Start My EV Conversion →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="card hover:border-lime-700/50
                             transition-all block group">
                  <div className="flex items-center
                                  justify-between gap-4">

                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {VEHICLE_ICONS[order.vehicle.type] || "🚗"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-white">
                            {order.vehicle.brand} {order.vehicle.model}
                          </span>
                          <span className="text-gw-600 text-xs">
                            {order.vehicle.year}
                          </span>
                        </div>
                        <div className="text-gw-500 text-xs mb-2">
                          {order.orderNumber} · {" "}
                          {new Date(order.createdAt)
                            .toLocaleDateString("en-IN", {
                              day:   "numeric",
                              month: "short",
                              year:  "numeric",
                            })}
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-gw-500 group-hover:text-white
                                    transition-colors shrink-0">
                      View →
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}