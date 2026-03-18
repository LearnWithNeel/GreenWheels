"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function VendorDashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="mb-8">
          <div className="badge-green inline-block mb-3">
            Vendor Dashboard
          </div>
          <h1 className="font-black text-3xl text-white mb-1">
            Welcome back, {name}! 🏭
          </h1>
          <p className="text-gw-400 text-sm">
            Manage your products and track your sales from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📦", label: "Total Products", value: "0",  desc: "Listed products"   },
            { icon: "✅", label: "Active",          value: "0",  desc: "Live on shop"      },
            { icon: "💰", label: "Total Sales",     value: "₹0", desc: "Lifetime earnings" },
            { icon: "⭐", label: "Rating",          value: "—",  desc: "Avg rating"        },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-black text-2xl text-white mb-1">
                {s.value}
              </div>
              <div className="font-bold text-gw-300 text-sm mb-1">
                {s.label}
              </div>
              <div className="text-gw-600 text-xs">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "➕", label: "Add Product",
              desc:  "List a new product on the shop",
              href:  "/vendor/products/add", primary: true  },
            { icon: "📦", label: "My Products",
              desc:  "View and manage all your listings",
              href:  "/vendor/products",     primary: false },
            { icon: "📋", label: "Orders",
              desc:  "View customer orders for your products",
              href:  "/vendor/orders",       primary: false },
          ].map(a => (
            <Link key={a.label} href={a.href}
              style={{ border: "1px solid #14532d" }}
              className="bg-gw-900/30 rounded-xl p-5
                         hover:border-lime-700/50 transition-all
                         group block">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className={`font-black text-lg mb-1 transition-colors
                ${a.primary
                  ? "text-lime-400 group-hover:text-white"
                  : "text-white"}`}>
                {a.label}
              </h3>
              <p className="text-gw-400 text-sm">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Platform info */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-white text-xl mb-4">
            📋 Vendor Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "All products are reviewed by admin before going live",
              "GreenWheels takes 10% commission on every sale",
              "ARAI/BIS approved products get verified badge — more sales",
              "Fake or uncertified products result in immediate ban",
              "Payouts processed every 15 days to your bank account",
              "Keep stock updated — out of stock items are auto-hidden",
              "Respond to customer complaints within 48 hours",
              "Minimum product price: ₹100 — No maximum limit",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lime-400 shrink-0 text-xs mt-0.5">✓</span>
                <span className="text-gw-400 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commission info */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-5">
          <h3 className="font-black text-white text-lg mb-3">
            💰 Commission Structure
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { category: "EV Kits",    commission: "8%"  },
              { category: "Batteries",  commission: "10%" },
              { category: "Motors",     commission: "10%" },
              { category: "Chargers",   commission: "12%" },
              { category: "Safety",     commission: "12%" },
              { category: "Accessories",commission: "15%" },
              { category: "New EVs",    commission: "5%"  },
              { category: "Others",     commission: "10%" },
            ].map(item => (
              <div key={item.category}
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-3 py-3 text-center">
                <p className="text-white text-xs font-bold mb-1">
                  {item.category}
                </p>
                <p className="text-lime-400 font-black text-lg">
                  {item.commission}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}