"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

type Order = {
  _id:         string;
  orderNumber: string;
  status:      string;
  createdAt:   string;
  customer: {
    name:  string;
    email: string;
    phone: string;
  };
  vehicle: {
    type:  string;
    brand: string;
    model: string;
    year:  number;
    registrationNumber: string;
  };
  retrofit: { type: string };
  payment: { totalAmount: number };
};

const VEHICLE_ICONS: Record<string, string> = {
  car: "🚗", bike: "🏍️", auto: "🛺",
};

export default function DealerOrdersPage() {
  const [tab, setTab]           = useState<"available"|"active"|"completed">("available");
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, [tab]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/dealer/orders?type=${tab}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {}
    finally { setLoading(false); }
  }

  async function acceptOrder(orderId: string) {
    setActing(orderId);
    try {
      const res  = await fetch(`/api/dealer/orders/${orderId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "accept" }),
      });
      const data = await res.json();
      if (data.success) loadOrders();
      else alert(data.message);
    } catch {}
    finally { setActing(null); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="mb-8">
          <div className="badge-green inline-block mb-3">My Orders</div>
          <h1 className="font-black text-3xl text-white mb-1">
            Order Management
          </h1>
          <p className="text-gw-400 text-sm">
            Accept new orders and manage your active jobs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "available", label: "🆕 Available Orders" },
            { key: "active",    label: "⚡ Active Jobs"       },
            { key: "completed", label: "✅ Completed"         },
          ] as const).map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold
                whitespace-nowrap transition-all
                ${tab === t.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="card text-center py-8">
            <p className="text-gw-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">
              {tab === "available" ? "📭" : tab === "active" ? "⚡" : "✅"}
            </div>
            <h3 className="font-black text-white text-lg mb-2">
              No {tab} orders
            </h3>
            <p className="text-gw-400 text-sm">
              {tab === "available"
                ? "No new orders available in your area right now."
                : tab === "active"
                ? "You have no active jobs currently."
                : "No completed orders yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between gap-4">

                  {/* Left */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl shrink-0">
                      {VEHICLE_ICONS[order.vehicle?.type] || "🚗"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-white">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </span>
                        <span className="text-gw-600 text-xs">
                          {order.vehicle?.year}
                        </span>
                        <OrderStatusBadge status={order.status}/>
                      </div>
                      <p className="text-gw-500 text-xs mb-1">
                        {order.orderNumber} ·{" "}
                        {order.vehicle?.registrationNumber}
                      </p>
                      {order.customer && (
                        <p className="text-gw-500 text-xs mb-1">
                          Customer: {order.customer.name} ·{" "}
                          {order.customer.phone}
                        </p>
                      )}
                      <p className="text-gw-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {tab === "available" && (
                      <button
                        onClick={() => acceptOrder(order._id)}
                        disabled={acting === order._id}
                        className="btn-primary text-xs py-2 px-4">
                        {acting === order._id ? "Accepting..." : "✅ Accept"}
                      </button>
                    )}
                    {(tab === "active" || tab === "completed") && (
                      <Link
                        href={`/dealer/orders/${order._id}`}
                        className="btn-secondary text-xs py-2 px-4 text-center">
                        Manage →
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}