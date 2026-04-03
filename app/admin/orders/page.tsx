"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

type Order = {
  _id:         string;
  orderNumber: string;
  status:      string;
  createdAt:   string;
  customer:    { name: string; email: string; phone: string };
  dealer?:     { name: string; garageName: string };
  vehicle:     { brand: string; model: string; type: string; year: number };
};

const VEHICLE_ICONS: Record<string, string> = {
  car: "🚗", bike: "🏍️", auto: "🛺",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [total, setTotal]     = useState(0);

  useEffect(() => { loadOrders(); }, [filter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/orders?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              All Orders
            </h1>
          </div>
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-xl px-4 py-2 text-center">
            <p className="text-lime-400 font-black text-xl">{total}</p>
            <p className="text-gw-500 text-xs">Total</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            "all",
            "inquiry_submitted",
            "dealer_accepted",
            "verification_passed",
            "retrofit_in_progress",
            "delivered",
            "cancelled",
          ].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold
                whitespace-nowrap capitalize transition-all
                ${filter === f
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No orders found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <Link key={order._id}
                href={`/orders/${order._id}`}
                className="card hover:border-lime-700/50 transition-all
                           block group">
                <div className="flex items-start justify-between gap-4">
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
                        Customer: {order.customer?.name}
                      </p>
                      {order.dealer && (
                        <p className="text-gw-600 text-xs">
                          Dealer: {order.dealer.garageName || order.dealer.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-gw-600 group-hover:text-white
                                  transition-colors text-xs shrink-0">
                    View →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}