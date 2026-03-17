"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DealerDashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="badge-green inline-block mb-3">
            Dealer Dashboard
          </div>
          <h1 className="font-black text-3xl text-white mb-1">
            Welcome back, {name}! 🔧
          </h1>
          <p className="text-gw-400 text-sm">
            Manage your orders, workshop and earnings from here.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "📋", label: "New Orders",      value: "0", desc: "Pending acceptance"   },
            { icon: "🔧", label: "Active Jobs",     value: "0", desc: "In progress"          },
            { icon: "✅", label: "Completed",        value: "0", desc: "Total jobs done"      },
            { icon: "⭐", label: "Rating",           value: "—", desc: "Avg customer rating" },
            { icon: "💰", label: "Total Earnings",  value: "₹0", desc: "Lifetime earnings"  },
            { icon: "🛡️", label: "Profile Status",  value: "Pending", desc: "Admin approval"},
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

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "👤", label: "Complete Profile",
              desc: "Get admin approved to start receiving orders",
              href: "/dealer/profile", primary: true },
            { icon: "📋", label: "View Orders",
              desc: "Check new and active retrofit orders",
              href: "/dealer/orders", primary: false },
            { icon: "🛒", label: "Shop EV Parts",
              desc: "Buy ARAI approved kits and accessories",
              href: "/shop", primary: false },
          ].map(a => (
            <Link key={a.label} href={a.href}
              style={{ border: "1px solid #14532d" }}
              className="bg-gw-900/30 rounded-xl p-5 hover:border-lime-700/50
                         transition-all group block">
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

        {/* ── RTO & Compliance Guide ── */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-white text-xl mb-4">
            📋 RTO & Compliance Checklist
          </h2>
          <p className="text-gw-400 text-sm mb-4">
            Every retrofit on GreenWheels must follow these steps.
            As a verified dealer you are responsible for ensuring
            full legal compliance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { done: true,  text: "Use only ARAI/ICAT approved EV conversion kits" },
              { done: true,  text: "Verify vehicle fitness before accepting order" },
              { done: false, text: "File Form 22C Part-I with RTO before starting work" },
              { done: false, text: "Get RTO permission within 7 working days" },
              { done: false, text: "Complete retrofit at certified ERFC workshop" },
              { done: false, text: "Pass post-retrofit quality inspection" },
              { done: false, text: "File Form 22C Part-II after retrofit completion" },
              { done: false, text: "Ensure RC book update to show Electric fuel type" },
            ].map((item, i) => (
              <div key={i}
                style={{ border: "1px solid #14532d" }}
                className="flex items-start gap-3 bg-gw-900/30
                           rounded-xl px-4 py-3">
                <span className={`text-sm shrink-0 mt-0.5
                  ${item.done ? "text-lime-400" : "text-gw-600"}`}>
                  {item.done ? "✅" : "⬜"}
                </span>
                <span className={`text-sm
                  ${item.done ? "text-gw-300" : "text-gw-500"}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-xl px-4 py-3 mt-4">
            <p className="text-gw-400 text-xs leading-relaxed">
              <span className="text-white font-semibold">
                ⚠️ Important:{" "}
              </span>
              Failing to follow RTO process can result in customer
              penalty and removal from GreenWheels platform.
              <Link href="/legal"
                className="text-lime-400 hover:text-white ml-1">
                Read full legal guidelines →
              </Link>
            </p>
          </div>
        </div>

        {/* ── ARAI Approved Kits Info ── */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-white text-xl mb-4">
            ⚡ ARAI Approved EV Kits You Can Use
          </h2>
          <p className="text-gw-400 text-sm mb-4">
            Only these approved manufacturers' kits are permitted
            on GreenWheels platform. Using unapproved kits will
            result in immediate account suspension.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Bosch eAxle",   type: "Car / SUV",     approved: true  },
              { name: "Loop Moto",     type: "Bike / Scooter",approved: true  },
              { name: "E-Trio",        type: "Car / Auto",    approved: true  },
              { name: "Bharat Kits",   type: "All Vehicles",  approved: true  },
              { name: "EV Motoo",      type: "Bike / Scooter",approved: true  },
              { name: "Lectrix",       type: "Scooter",       approved: true  },
              { name: "GoEgo",         type: "Auto-Rickshaw", approved: true  },
              { name: "Other Brands",  type: "Submit for review", approved: false },
            ].map(kit => (
              <div key={kit.name}
                style={{
                  border: `1px solid ${kit.approved ? "#14532d" : "#991b1b"}`
                }}
                className={`rounded-xl px-3 py-3 text-center
                  ${kit.approved ? "bg-gw-900/30" : "bg-red-900/10"}`}>
                <div className={`text-xs font-black mb-1
                  ${kit.approved ? "text-white" : "text-red-400"}`}>
                  {kit.name}
                </div>
                <div className="text-gw-600 text-xs">{kit.type}</div>
                <div className={`text-xs mt-1
                  ${kit.approved ? "text-lime-400" : "text-red-500"}`}>
                  {kit.approved ? "✅ Approved" : "⚠️ Review"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Important Links ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/20 rounded-2xl p-5">
            <h3 className="font-black text-white text-lg mb-3">
              📄 Important Documents
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Form 22C — RTO Retrofit Application",
                  href: "/legal" },
                { label: "MoRTH GSR 167(E) — EV Retrofit Rules",
                  href: "/legal" },
                { label: "ARAI Kit Approval Guidelines",
                  href: "/legal" },
                { label: "GreenWheels Dealer Agreement",
                  href: "/legal" },
              ].map(doc => (
                <Link key={doc.label} href={doc.href}
                  className="text-gw-400 hover:text-lime-400
                             text-sm transition-colors flex
                             items-center gap-2">
                  <span className="text-gw-700">→</span>
                  {doc.label}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/20 rounded-2xl p-5">
            <h3 className="font-black text-white text-lg mb-3">
              🛡️ Dealer Responsibilities
            </h3>
            <div className="flex flex-col gap-2">
              {[
                "Handle all RTO paperwork on customer's behalf",
                "Use only ARAI/ICAT approved conversion kits",
                "Provide 6-month warranty on retrofit work",
                "Complete work within agreed timeline",
                "Update order status at every phase",
                "Never collect payment before verification",
              ].map((r, i) => (
                <div key={i}
                  className="flex items-start gap-2 text-gw-400 text-sm">
                  <span className="text-lime-400 shrink-0">•</span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Franchise subtle ── */}
        <div style={{ border: "1px solid #14532d" }}
          className="rounded-xl px-5 py-4 flex items-center
                     justify-between gap-4 opacity-50
                     hover:opacity-100 transition-opacity duration-300">
          <div>
            <p className="text-gw-500 text-xs mb-0.5">
              Want to expand your business?
            </p>
            <p className="text-white text-sm font-semibold">
              Explore GreenWheels Franchise Program 🏪
            </p>
          </div>
          <Link href="/franchise"
            className="text-lime-400 text-xs hover:text-white
                       transition-colors shrink-0 font-medium
                       whitespace-nowrap">
            Learn More →
          </Link>
        </div>

      </section>
    </main>
  );
}