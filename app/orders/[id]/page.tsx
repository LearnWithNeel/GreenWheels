"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
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

type RazorpayOptions = {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: Record<string, string>) => Promise<void>;
  theme: { color: string };
};

export default function OrderPage() {
  const { data: session } = useSession();
  const params = useParams() as { id: string };
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
      if (!data.success) {
        setError(data.message);
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTokenPayment() {
    if (!order) return;

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id, paymentType: "token" }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "GreenWheels",
        description: `Token Payment — ${order.orderNumber}`,
        order_id: data.razorpayOrderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              orderId: order._id,
              paymentType: "token",
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful!");
            loadOrder();
          }
        },
        theme: { color: "#a3e635" },
      };

      const RazorpayCtor = (window as unknown as {
        Razorpay: new (options: RazorpayOptions) => { open: () => void };
      }).Razorpay;

      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch {
      alert("Payment failed. Try again.");
    }
  }

  async function handleFinalPayment() {
    if (!order) return;

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id, paymentType: "final" }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "GreenWheels",
        description: `Final Payment — ${order.orderNumber}`,
        order_id: data.razorpayOrderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              orderId: order._id,
              paymentType: "final",
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Final payment successful! Your invoice is ready.");
            loadOrder();
          }
        },
        theme: { color: "#a3e635" },
      };

      const RazorpayCtor = (window as unknown as {
        Razorpay: new (options: RazorpayOptions) => { open: () => void };
      }).Razorpay;

      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch {
      alert("Payment failed. Try again.");
    }
  }

  async function downloadInvoice() {
    if (!order) return;

    try {
      const res = await fetch(`/api/invoice/${order._id}`);
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(10, 46, 22);
      doc.text("GreenWheels", 20, 20);
      doc.setFontSize(12);
      doc.text("EV Retrofit Invoice", 20, 28);
      doc.setFontSize(10);
      doc.text(`Invoice No: ${data.invoice.orderNumber}`, 20, 40);
      doc.text(
        `Date: ${new Date(data.invoice.date).toLocaleDateString("en-IN")}`,
        20,
        47
      );

      doc.setFontSize(11);
      doc.text("Customer Details:", 20, 60);
      doc.setFontSize(10);
      doc.text(`Name:  ${data.invoice.customer?.name || "—"}`, 20, 67);
      doc.text(`Email: ${data.invoice.customer?.email || "—"}`, 20, 73);
      doc.text(`Phone: ${data.invoice.customer?.phone || "—"}`, 20, 79);

      doc.setFontSize(11);
      doc.text("Vehicle Details:", 20, 92);
      autoTable(doc, {
        startY: 97,
        head: [["Field", "Details"]],
        body: [
          [
            "Vehicle",
            `${data.invoice.vehicle.brand} ${data.invoice.vehicle.model} (${data.invoice.vehicle.year})`,
          ],
          ["Registration No.", data.invoice.vehicle.registrationNumber],
          ["Original Fuel Type", data.invoice.vehicle.fuelType],
          ["Retrofit Type", data.invoice.retrofit.type],
          ["Motor Power", data.invoice.retrofit.motorPower],
          ["Battery Capacity", data.invoice.retrofit.batteryCapacity],
        ],
      });

      const finalY =
        (doc as unknown as { lastAutoTable?: { finalY?: number } })
          .lastAutoTable?.finalY || 160;

      doc.setFontSize(11);
      doc.text("Payment Summary:", 20, finalY + 10);
      autoTable(doc, {
        startY: finalY + 15,
        head: [["Description", "Amount"]],
        body: [
          ["Total Amount", `₹${data.invoice.payment.totalAmount?.toLocaleString()}`],
          ["Token Paid (30%)", `₹${data.invoice.payment.tokenAmount?.toLocaleString()}`],
          ["Final Paid (70%)", `₹${data.invoice.payment.finalAmount?.toLocaleString()}`],
        ],
      });

      doc.setFontSize(9);
      doc.text("Thank you for choosing GreenWheels!", 20, 270);
      doc.text("This is a system-generated invoice.", 20, 276);

      doc.save(`GreenWheels-Invoice-${data.invoice.orderNumber}.pdf`);
    } catch {
      alert("Invoice download failed. Try again.");
    }
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
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-gw-500 text-sm hover:text-white transition-colors mb-2 block"
            >
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

          <div
            style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/50 rounded-xl px-4 py-3 text-right shrink-0"
          >
            {order.status === "verification_passed" && !order.payment.tokenPaid && (
              <button onClick={handleTokenPayment} className="btn-primary w-full mb-4">
                💳 Pay Token Amount (30%) —
                ₹
                {order.payment.tokenAmount > 0
                  ? order.payment.tokenAmount.toLocaleString()
                  : Math.round((order.payment.totalAmount || 0) * 0.3).toLocaleString()}
              </button>
            )}

            {order.status === "rto_filed" && !order.payment.finalPaid && (
              <button onClick={handleFinalPayment} className="btn-primary w-full mb-4">
                💳 Pay Final Amount (70%) —
                ₹
                {order.payment.finalAmount > 0
                  ? order.payment.finalAmount.toLocaleString()
                  : Math.round((order.payment.totalAmount || 0) * 0.7).toLocaleString()}
              </button>
            )}

            {order.payment.finalPaid && (
              <button onClick={downloadInvoice} className="btn-secondary w-full mb-4">
                📄 Download Invoice
              </button>
            )}

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

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: "timeline", label: "📋 Timeline" },
            { key: "vehicle", label: "🚗 Vehicle" },
            { key: "photos", label: "📷 Photos" },
            { key: "payment", label: "💰 Payment" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card">
          {activeTab === "timeline" && (
            <div>
              <h2 className="font-black text-white text-lg mb-6">Order Progress</h2>
              <OrderTimeline currentStatus={order.status} history={order.history} />
            </div>
          )}

          {activeTab === "vehicle" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">Vehicle Details</h2>
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
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3"
                  >
                    <div className="text-gw-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-semibold capitalize">{item.value}</div>
                  </div>
                ))}
              </div>

              <h2 className="font-black text-white text-lg mb-4">Retrofit Specs</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  {
                    label: "Retrofit Type",
                    value: RETROFIT_LABELS[order.retrofit.type] || order.retrofit.type,
                  },
                  { label: "Motor Power", value: order.retrofit.motorPower },
                  { label: "Battery Capacity", value: order.retrofit.batteryCapacity },
                  { label: "Expected Range", value: order.retrofit.expectedRange },
                  { label: "Charging Type", value: order.retrofit.chargingType },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3"
                  >
                    <div className="text-gw-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-semibold capitalize">{item.value}</div>
                  </div>
                ))}
              </div>

              {order.retrofit.specialRequests && (
                <div
                  style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3 mt-4"
                >
                  <div className="text-gw-500 text-xs mb-1">Special Requests</div>
                  <div className="text-white text-sm">{order.retrofit.specialRequests}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">Vehicle Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { url: order.vehicle.photos.front, label: "Front View" },
                  { url: order.vehicle.photos.back, label: "Back View" },
                  { url: order.vehicle.photos.left, label: "Left Side" },
                  { url: order.vehicle.photos.right, label: "Right Side" },
                ].map(({ url, label }) => (
                  <div key={label}>
                    <p className="text-gw-500 text-xs mb-2">{label}</p>
                    <a href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={label}
                        className="w-full h-40 object-cover rounded-xl hover:opacity-80 transition-all cursor-pointer"
                      />
                    </a>
                    <a
                      href={url}
                      download
                      className="text-lime-400 text-xs mt-1 block hover:underline"
                    >
                      ⬇ Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <h2 className="font-black text-white text-lg mb-4">Payment Details</h2>
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
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-gw-500 text-sm">{item.label}</span>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3"
              >
                <p className="text-gw-400 text-xs leading-relaxed">
                  <span className="text-white font-semibold">⚠️ Remember: </span>
                  Token payment is only collected after verification passes. Final payment
                  is collected only after vehicle is delivered and you are satisfied.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}