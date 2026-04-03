"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import OrderTimeline from "@/components/OrderTimeline";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { PHASES } from "@/lib/orderPhases";

type Order = {
  _id:         string;
  orderNumber: string;
  status:      string;
  createdAt:   string;
  scheduledDate?: string;
  customer: {
    name:  string;
    email: string;
    phone: string;
  };
  vehicle: {
    type:               string;
    brand:              string;
    model:              string;
    year:               number;
    registrationNumber: string;
    fuelType:           string;
    kmDriven:           number;
    color:              string;
    photos: {
      front: string; back: string; left: string; right: string;
    };
  };
  retrofit: {
    type:            string;
    motorPower:      string;
    batteryCapacity: string;
    expectedRange:   string;
    chargingType:    string;
    specialRequests: string;
  };
  payment: {
    totalAmount: number;
    tokenAmount: number;
    tokenPaid:   boolean;
    finalPaid:   boolean;
  };
  history: {
    status:    string;
    note:      string;
    updatedAt: string;
  }[];
};

const DEALER_PHASES = [
  { status: "verification_scheduled",  label: "Schedule Verification",   icon: "📅" },
  { status: "verification_ongoing",    label: "Mark Verification Started",icon: "🔍" },
  { status: "verification_passed",     label: "Verification Passed",      icon: "✅" },
  { status: "verification_failed",     label: "Verification Failed",      icon: "❌" },
  { status: "pickup_scheduled",        label: "Schedule Pickup",          icon: "📍" },
  { status: "vehicle_picked_up",       label: "Vehicle Picked Up",        icon: "🚗" },
  { status: "retrofit_in_progress",    label: "Start Retrofit Work",      icon: "⚡" },
  { status: "quality_check_done",      label: "Quality Check Done",       icon: "🛡️" },
  { status: "rto_filed",               label: "RTO & Form 22C Filed",     icon: "📄" },
  { status: "delivered",               label: "Mark as Delivered",        icon: "🎉" },
];

export default function DealerOrderDetailPage() {
  const params                    = useParams() as { id: string };
  const router                    = useRouter();
  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [scheduledDate, setScheduledDate]     = useState("");
  const [activeTab, setActiveTab] = useState<"timeline"|"vehicle"|"actions">("timeline");

  useEffect(() => { loadOrder(); }, [params.id]);

  async function loadOrder() {
    try {
      const res  = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        if (data.order.payment?.totalAmount) {
          setEstimatedAmount(String(data.order.payment.totalAmount));
        }
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function updatePhase(newStatus: string) {
    setUpdating(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`/api/dealer/orders/${params.id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:          "update_phase",
          note:            newStatus,
          newStatus,
          scheduledDate:   scheduledDate || undefined,
          estimatedAmount: estimatedAmount
            ? Number(estimatedAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess(`Updated to: ${DEALER_PHASES.find(p => p.status === newStatus)?.label || newStatus}`);
      loadOrder();
    } catch { setError("Something went wrong."); }
    finally { setUpdating(false); }
  }

  async function rejectOrder() {
    if (!confirm("Reject this order? It will go back to the available pool.")) return;
    setUpdating(true);
    try {
      const res  = await fetch(`/api/dealer/orders/${params.id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "reject" }),
      });
      const data = await res.json();
      if (data.success) router.push("/dealer/orders");
    } catch {}
    finally { setUpdating(false); }
  }

  if (loading) return (
    <main className="page-wrapper flex items-center justify-center">
      <p className="text-gw-400">Loading order...</p>
    </main>
  );

  if (!order) return (
    <main className="page-wrapper flex items-center justify-center">
      <p className="text-red-400">Order not found.</p>
    </main>
  );

  // Next available phase for this order
  const currentPhaseIndex = DEALER_PHASES.findIndex(
    p => p.status === order.status
  );
  const nextPhases = DEALER_PHASES.filter((_, i) => i > currentPhaseIndex);

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <Link href="/dealer/orders"
              className="text-gw-500 text-sm hover:text-white
                         transition-colors mb-2 block">
              ← Back to Orders
            </Link>
            <h1 className="font-black text-2xl text-white mb-2">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <OrderStatusBadge status={order.status}/>
              <span className="text-gw-600 text-xs">
                {order.customer?.name} · {order.customer?.phone}
              </span>
            </div>
          </div>
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/50 rounded-xl px-4 py-3 text-right shrink-0">
            <div className="text-2xl mb-1">🚗</div>
            <div className="text-white font-bold text-sm">
              {order.vehicle?.brand} {order.vehicle?.model}
            </div>
            <div className="text-gw-500 text-xs">
              {order.vehicle?.registrationNumber}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "timeline", label: "📋 Timeline"  },
            { key: "vehicle",  label: "🚗 Vehicle"   },
            { key: "actions",  label: "⚡ Actions"   },
          ] as const).map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold
                transition-all
                ${activeTab === t.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card">

          {/* Timeline */}
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

          {/* Vehicle */}
          {activeTab === "vehicle" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">
                Vehicle Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                {[
                  { label: "Brand",        value: order.vehicle?.brand         },
                  { label: "Model",        value: order.vehicle?.model         },
                  { label: "Year",         value: order.vehicle?.year          },
                  { label: "Color",        value: order.vehicle?.color         },
                  { label: "Fuel Type",    value: order.vehicle?.fuelType      },
                  { label: "KM Driven",    value: `${order.vehicle?.kmDriven} km` },
                  { label: "Reg. Number",  value: order.vehicle?.registrationNumber },
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

              {/* Retrofit specs */}
              <h2 className="font-black text-white text-lg mb-4">
                Retrofit Requirements
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                {[
                  { label: "Type",         value: order.retrofit?.type          },
                  { label: "Motor Power",  value: order.retrofit?.motorPower    },
                  { label: "Battery",      value: order.retrofit?.batteryCapacity },
                  { label: "Range",        value: order.retrofit?.expectedRange },
                  { label: "Charging",     value: order.retrofit?.chargingType  },
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

              {order.retrofit?.specialRequests && (
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <div className="text-gw-500 text-xs mb-1">Special Requests</div>
                  <div className="text-white text-sm">
                    {order.retrofit.specialRequests}
                  </div>
                </div>
              )}

              {/* Vehicle photos */}
              {order.vehicle?.photos && (
                <div className="mt-6">
                  <h3 className="font-black text-white text-base mb-3">
                    Vehicle Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(order.vehicle.photos).map(([side, url]) => (
                      <div key={side}>
                        <p className="text-gw-500 text-xs mb-1 capitalize">
                          {side} view
                        </p>
                        <a href={url} target="_blank">
                          <img src={url} alt={side}
                            className="w-full h-36 object-cover rounded-xl
                                       hover:opacity-80 transition-all"/>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {activeTab === "actions" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">
                Update Order Progress
              </h2>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50
                                text-red-400 text-sm rounded-xl
                                px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-gw-900/50 border border-lime-700/50
                                text-lime-400 text-sm rounded-xl
                                px-4 py-3 mb-4">
                  ✅ {success}
                </div>
              )}

              {/* Estimated amount */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="label">
                    Estimated Total Amount (₹)
                  </label>
                  <input className="input" type="number"
                    placeholder="e.g. 150000"
                    value={estimatedAmount}
                    onChange={e => setEstimatedAmount(e.target.value)}/>
                  <p className="text-gw-600 text-xs mt-1">
                    Set after verification passes
                  </p>
                </div>
                <div>
                  <label className="label">Scheduled Date</label>
                  <input className="input" type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}/>
                  <p className="text-gw-600 text-xs mt-1">
                    For verification or pickup
                  </p>
                </div>
              </div>

              {/* Next phase buttons */}
              <h3 className="font-bold text-white text-sm mb-3">
                Available Actions for Current Status
              </h3>

              {nextPhases.length === 0 ? (
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-4 text-center">
                  <p className="text-lime-400 font-bold">
                    🎉 Order Complete!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Show only next logical phase + failed option */}
                  {nextPhases.slice(0, 1).map(phase => (
                    <button key={phase.status}
                      onClick={() => updatePhase(phase.status)}
                      disabled={updating}
                      className="flex items-center gap-3 px-4 py-4
                                 bg-gw-900/50 rounded-xl border
                                 border-lime-700/50 hover:bg-gw-900
                                 transition-all text-left w-full">
                      <span className="text-2xl">{phase.icon}</span>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {updating ? "Updating..." : phase.label}
                        </p>
                        <p className="text-gw-500 text-xs">
                          Mark order as: {phase.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Verification failed — special case */}
                  {["verification_scheduled","verification_ongoing"].includes(
                    order.status
                  ) && (
                    <button
                      onClick={() => updatePhase("verification_failed")}
                      disabled={updating}
                      style={{ border: "1px solid #991b1b" }}
                      className="flex items-center gap-3 px-4 py-4
                                 bg-red-900/10 rounded-xl hover:bg-red-900/20
                                 transition-all text-left w-full">
                      <span className="text-2xl">❌</span>
                      <div>
                        <p className="text-red-400 font-bold text-sm">
                          Verification Failed
                        </p>
                        <p className="text-gw-500 text-xs">
                          Vehicle did not pass inspection
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Reject order */}
              {!["delivered","cancelled","verification_failed"].includes(
                order.status
              ) && order.status === "dealer_accepted" && (
                <div className="mt-6">
                  <button
                    onClick={rejectOrder}
                    disabled={updating}
                    style={{ border: "1px solid #991b1b" }}
                    className="w-full py-3 rounded-xl text-red-400
                               hover:bg-red-900/20 transition-all
                               font-bold text-sm">
                    Return Order to Pool
                  </button>
                  <p className="text-gw-600 text-xs text-center mt-1">
                    Only available before verification starts
                  </p>
                </div>
              )}

              {/* Payment status */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-4 mt-6">
                <h3 className="font-bold text-white text-sm mb-3">
                  💰 Payment Status
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-gw-500 text-xs mb-1">Token (30%)</p>
                    <p className={`font-black text-lg ${
                      order.payment?.tokenPaid
                        ? "text-lime-400" : "text-yellow-400"
                    }`}>
                      {order.payment?.tokenPaid ? "Paid ✅" : "Pending"}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-gw-500 text-xs mb-1">Total Amount</p>
                    <p className="font-black text-lg text-white">
                      {order.payment?.totalAmount
                        ? `₹${order.payment.totalAmount.toLocaleString()}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </section>
    </main>
  );
}