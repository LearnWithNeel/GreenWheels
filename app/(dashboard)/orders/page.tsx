"use client";
import { useState, useEffect } from "react";
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

const RETROFIT_LABELS: Record<string, string> = {
  pure_electric: "⚡ Pure Electric",
  hybrid:        "🔋 Hybrid",
};

export default function OrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | "active" | "completed" | "cancelled">("all");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const res  = await fetch("/api/orders/my-orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {}
    finally { setLoading(false); }
  }

  const filtered = orders.filter(o => {
    if (filter === "active")    return !["delivered", "cancelled", "verification_failed"].includes(o.status);
    if (filter === "completed") return o.status === "delivered";
    if (filter === "cancelled") return ["cancelled", "verification_failed"].includes(o.status);
    return true;
  });

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-3">My Orders</div>
            <h1 className="font-black text-3xl text-white">
              All Orders
            </h1>
          </div>
          <Link href="/retrofit" className="btn-primary text-sm py-2 px-4">
            + New Retrofit
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "all",       label: `All (${orders.length})` },
            { key: "active",    label: `Active (${orders.filter(o => !["delivered","cancelled","verification_failed"].includes(o.status)).length})` },
            { key: "completed", label: `Completed (${orders.filter(o => o.status === "delivered").length})` },
            { key: "cancelled", label: `Cancelled (${orders.filter(o => ["cancelled","verification_failed"].includes(o.status)).length})` },
          ] as const).map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold
                transition-all whitespace-nowrap
                ${filter === f.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="card text-center py-8">
            <p className="text-gw-400">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-black text-white text-lg mb-2">
              No orders found
            </h3>
            <p className="text-gw-400 text-sm mb-6">
              {filter === "all"
                ? "You haven't submitted any retrofit inquiries yet."
                : `No ${filter} orders found.`}
            </p>
            {filter === "all" && (
              <Link href="/retrofit" className="btn-primary">
                Start My EV Conversion →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(order => (
              <Link key={order._id}
                href={`/orders/${order._id}`}
                className="card hover:border-lime-700/50
                           transition-all block group">
                <div className="flex items-center justify-between gap-4">

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
                        {order.orderNumber} · {RETROFIT_LABELS[order.retrofit.type] || order.retrofit.type} · {" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day:   "numeric",
                          month: "short",
                          year:  "numeric",
                        })}
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Right */}
                  <span className="text-gw-500 group-hover:text-white
                                   transition-colors shrink-0 text-sm">
                    View Details →
                  </span>

                </div>
              </Link>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}