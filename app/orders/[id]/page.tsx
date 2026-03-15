"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import OrderTimeline from "@/components/OrderTimeline";
import OrderStatusBadge from "@/components/OrderStatusBadge";

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    type: string;
    brand: string;
    model: string;
    year: number;
    registrationNumber: string;
    color: string;
    fuelType: string;
    kmDriven: number;
    photos: {
      front: string;
      back: string;
      left: string;
      right: string;
    };
  };
  retrofit: {
    type: string;
    motorPower: string;
    batteryCapacity: string;
    expectedRange: string;
    chargingType: string;
    specialRequests: string;
  };
  payment: {
    totalAmount: number;
    tokenAmount: number;
    finalAmount: number;
    tokenPaid: boolean;
    finalPaid: boolean;
  };
  history: {
    status: string;
    note: string;
    updatedAt: string;
  }[];
};

const VEHICLE_ICONS: Record<string, string> = {
  car: "🚗",
  bike: "🏍️",
  auto: "🛺",
};

const RETROFIT_LABELS: Record<string, string> = {
  pure_electric: "Pure Electric",
  hybrid: "Hybrid",
};

export default function OrderPage() {
  const { data: session } = useSession();
  const params = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "timeline" | "vehicle" | "photos" | "payment"
  >("timeline");

  useEffect(() => {
    if (!params.id) return;
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setOrder(data.order);
    } catch { setError("Failed to load order."); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <main className="page-wrapper flex items-center justify-center">
        <p className="text-gw-400">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="page-wrapper flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Order not found."}</p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <Link href="/dashboard"
              className="text-gw-500 text-sm hover:text-white
                         transition-colors mb-2 block">
              ← Back to Dashboard
            </Link>
            <h1 className="font-black text-2xl text-white mb-2">
              Order {order.orderNumber}
            </h1>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="text-gw-600 text-xs">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/50 rounded-xl px-4 py-3 text-right shrink-0">
            <div className="text-3xl mb-1">
              {VEHICLE_ICONS[order.vehicle.type] || "🚗"}
            </div>
            <div className="text-white font-bold text-sm">
              {order.vehicle.brand} {order.vehicle.model}
            </div>
            <div className="text-gw-500 text-xs">
              {order.vehicle.year} · {order.vehicle.registrationNumber}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: "timeline", label: "📋 Timeline" },
            { key: "vehicle", label: "🚗 Vehicle" },
            { key: "photos", label: "📷 Photos" },
            { key: "payment", label: "💰 Payment" },
          ] as const).map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold
                whitespace-nowrap transition-all
                ${activeTab === tab.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">

          {activeTab === "timeline" && (
            <div>
              <h2 className="font-black text-white text-lg mb-6">
                Order Progress
              </h2>
              <OrderTimeline
                currentStatus={order.status}
                history={order.history}
              />
            </div>
          )}

          {activeTab === "vehicle" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">
                Vehicle Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                {[
                  { label: "Brand", value: order.vehicle.brand },
                  { label: "Model", value: order.vehicle.model },
                  { label: "Year", value: order.vehicle.year },
                  { label: "Color", value: order.vehicle.color },
                  { label: "Fuel Type", value: order.vehicle.fuelType },
                  { label: "KM Driven", value: `${order.vehicle.kmDriven} km` },
                  { label: "Reg. Number", value: order.vehicle.registrationNumber },
                  { label: "Vehicle Type", value: order.vehicle.type },
                ].map(item => (
                  <div key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3">
                    <div className="text-gw-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-semibold capitalize">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="font-black text-white text-lg mb-4">
                Retrofit Specs
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Retrofit Type", value: RETROFIT_LABELS[order.retrofit.type] || order.retrofit.type },
                  { label: "Motor Power", value: order.retrofit.motorPower },
                  { label: "Battery Capacity", value: order.retrofit.batteryCapacity },
                  { label: "Expected Range", value: order.retrofit.expectedRange },
                  { label: "Charging Type", value: order.retrofit.chargingType },
                ].map(item => (
                  <div key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3">
                    <div className="text-gw-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-semibold capitalize">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {order.retrofit.specialRequests && (
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3 mt-4">
                  <div className="text-gw-500 text-xs mb-1">Special Requests</div>
                  <div className="text-white text-sm">
                    {order.retrofit.specialRequests}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">
                Vehicle Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { url: order.vehicle.photos.front, label: "Front View" },
                  { url: order.vehicle.photos.back, label: "Back View" },
                  { url: order.vehicle.photos.left, label: "Left Side" },
                  { url: order.vehicle.photos.right, label: "Right Side" },
                ].map(({ url, label }) => (
                  <div key={label}>
                    <p className="text-gw-500 text-xs mb-2">{label}</p>
                    <a href={url} target="_blank">
                      <img src={url} alt={label}
                        className="w-full h-40 object-cover rounded-xl
                                   hover:opacity-80 transition-all cursor-pointer"/>
                    </a>
                    <a href={url} download
                      className="text-lime-400 text-xs mt-1 block hover:underline">
                      ⬇ Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">
                Payment Details
              </h2>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  {
                    label: "Total Amount",
                    value: order.payment.totalAmount
                      ? `₹${order.payment.totalAmount.toLocaleString()}`
                      : "To be confirmed after verification",
                    color: "text-white",
                  },
                  {
                    label: "Token Amount (30%)",
                    value: order.payment.tokenAmount
                      ? `₹${order.payment.tokenAmount.toLocaleString()}`
                      : "—",
                    color: "text-white",
                  },
                  {
                    label: "Final Amount (70%)",
                    value: order.payment.finalAmount
                      ? `₹${order.payment.finalAmount.toLocaleString()}`
                      : "—",
                    color: "text-white",
                  },
                  {
                    label: "Token Payment",
                    value: order.payment.tokenPaid ? "Paid ✅" : "Pending",
                    color: order.payment.tokenPaid ? "text-lime-400" : "text-yellow-400",
                  },
                  {
                    label: "Final Payment",
                    value: order.payment.finalPaid ? "Paid ✅" : "Pending",
                    color: order.payment.finalPaid ? "text-lime-400" : "text-yellow-400",
                  },
                ].map(item => (
                  <div key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3
                               flex items-center justify-between">
                    <span className="text-gw-500 text-sm">{item.label}</span>
                    <span className={`font-bold text-sm ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3">
                <p className="text-gw-400 text-xs leading-relaxed">
                  <span className="text-white font-semibold">⚠️ Remember: </span>
                  Token payment is only collected after verification passes.
                  Final payment is collected only after vehicle is delivered
                  and you are satisfied.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}