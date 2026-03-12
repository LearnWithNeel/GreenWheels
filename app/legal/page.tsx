"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ── State-wise EV subsidy data (India 2025) ───────────────────────────────────
const STATE_DATA: Record<string, {
  name: string;
  twoWheeler: string;
  threeWheeler: string;
  fourWheeler: string;
  roadTax: string;
  registration: string;
  extra: string;
}> = {
  "Gujarat": {
    name: "Gujarat",
    twoWheeler: "Up to ₹20,000",
    threeWheeler: "Up to ₹50,000",
    fourWheeler: "Up to ₹1,50,000",
    roadTax: "50% of standard rate",
    registration: "Fully waived (MoRTH)",
    extra: "One of India's highest EV subsidies. Electricity rate for EV charging: ₹4.1/unit — among the cheapest in India.",
  },
  "Maharashtra": {
    name: "Maharashtra",
    twoWheeler: "Up to ₹25,000",
    threeWheeler: "Up to ₹30,000",
    fourWheeler: "Up to ₹1,50,000",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Maharashtra offers India's highest total EV subsidy budget (₹535 crore). Scrap old petrol 2W and get extra ₹7,000 on new EV purchase.",
  },
  "Delhi": {
    name: "Delhi",
    twoWheeler: "Up to ₹30,000",
    threeWheeler: "Up to ₹30,000",
    fourWheeler: "Up to ₹1,50,000",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Delhi leads India in EV subsidies. Scrappage incentive for old CNG/petrol auto-rickshaws — convert to electric and get credit. Strong green zone policy.",
  },
  "Tamil Nadu": {
    name: "Tamil Nadu",
    twoWheeler: "Up to ₹10,000",
    threeWheeler: "Up to ₹10,000",
    fourWheeler: "Up to ₹1,00,000 (15% of cost)",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Tamil Nadu is India's largest EV manufacturing hub. Strong infrastructure investment. Local production incentives reduce vehicle cost further.",
  },
  "Karnataka": {
    name: "Karnataka",
    twoWheeler: "FAME-II central benefits only",
    threeWheeler: "FAME-II central benefits only",
    fourWheeler: "FAME-II central benefits only",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Karnataka was India's first state to have an EV policy (2017). Road tax fully waived. No direct purchase subsidy from state but strong infrastructure support.",
  },
  "Telangana": {
    name: "Telangana",
    twoWheeler: "FAME-II + ₹15,000 retrofit subsidy",
    threeWheeler: "FAME-II benefits",
    fourWheeler: "FAME-II benefits",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Telangana is one of few states offering a direct ₹15,000 subsidy for EV retrofit conversions — GreenWheels customers in Telangana benefit directly.",
  },
  "Rajasthan": {
    name: "Rajasthan",
    twoWheeler: "Up to ₹10,000",
    threeWheeler: "Up to ₹20,000",
    fourWheeler: "Up to ₹1,00,000",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Rajasthan provides purchase subsidies and road tax exemption under its EV policy.",
  },
  "Uttar Pradesh": {
    name: "Uttar Pradesh",
    twoWheeler: "Up to ₹5,000",
    threeWheeler: "Up to ₹12,000",
    fourWheeler: "Up to ₹1,00,000",
    roadTax: "70% of standard rate (30% discount)",
    registration: "Fully waived (MoRTH)",
    extra: "UP focuses on electric 3-wheelers and buses. 5,000 e-autos and 10,000 e-rickshaws subsidized under Punjab-style program.",
  },
  "Kerala": {
    name: "Kerala",
    twoWheeler: "% of cost subsidy",
    threeWheeler: "₹10,000 – ₹30,000",
    fourWheeler: "% of cost subsidy",
    roadTax: "50% for first 5 years",
    registration: "Fully waived (MoRTH)",
    extra: "Kerala offers 50% road tax discount for the first 5 years of EV ownership. Good subsidy on e-rickshaws.",
  },
  "Punjab": {
    name: "Punjab",
    twoWheeler: "FAME-II benefits",
    threeWheeler: "5,000 e-autos — up to ₹30,000",
    fourWheeler: "FAME-II benefits",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "Punjab has created special green zones in major cities where only EVs are permitted. Strong e-auto program.",
  },
  "Madhya Pradesh": {
    name: "Madhya Pradesh",
    twoWheeler: "FAME-II benefits",
    threeWheeler: "FAME-II benefits",
    fourWheeler: "FAME-II benefits",
    roadTax: "100% exempt",
    registration: "Fully waived (MoRTH)",
    extra: "MP follows central EV policy. Road tax fully waived under MoRTH guidelines.",
  },
  "Other": {
    name: "Your State",
    twoWheeler: "FAME-II central benefits apply",
    threeWheeler: "FAME-II central benefits apply",
    fourWheeler: "FAME-II central benefits apply",
    roadTax: "100% exempt (MoRTH)",
    registration: "Fully waived (MoRTH)",
    extra: "Your state follows central government EV policy. Registration fees are waived and road tax exempted nationwide under MoRTH guidelines. Check your state transport website for additional local subsidies.",
  },
};

const ALL_STATES = [
  "Gujarat","Maharashtra","Delhi","Tamil Nadu","Karnataka",
  "Telangana","Rajasthan","Uttar Pradesh","Kerala","Punjab",
  "Madhya Pradesh","Other"
];

// ── Map common city/state names from geolocation ─────────────────────────────
function normalizeState(raw: string): string {
  const map: Record<string, string> = {
    "gujarat": "Gujarat",
    "maharashtra": "Maharashtra",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "tamil nadu": "Tamil Nadu",
    "karnataka": "Karnataka",
    "telangana": "Telangana",
    "rajasthan": "Rajasthan",
    "uttar pradesh": "Uttar Pradesh",
    "kerala": "Kerala",
    "punjab": "Punjab",
    "madhya pradesh": "Madhya Pradesh",
  };
  return map[raw.toLowerCase()] ?? "Other";
}

export default function LegalPage() {
  const [selectedState, setSelectedState] = useState<string>("Gujarat");
  const [detecting, setDetecting]         = useState(true);
  const [detected, setDetected]           = useState(false);

  useEffect(() => {
    // Try to detect state from browser geolocation
    if (!navigator.geolocation) { setDetecting(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const raw  = data?.address?.state ?? "";
          const state = normalizeState(raw);
          setSelectedState(state);
          setDetected(true);
        } catch {
          // silently fall back to manual selection
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false)
    );
  }, []);

  const stateInfo = STATE_DATA[selectedState] ?? STATE_DATA["Other"];

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="badge-green inline-block mb-4">Legal & Process Info</div>
          <h1 className="font-black text-4xl md:text-5xl text-white mb-4">
            How GreenWheels Works
          </h1>
          <p className="text-gw-300 text-lg max-w-2xl mx-auto">
            Central government rules + your state-specific EV subsidies and policies.
            Updated for India 2025.
          </p>
        </div>

        {/* ── State Selector ── */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center
                          justify-between gap-4">
            <div>
              <h2 className="font-black text-xl text-white mb-1">
                📍 Your State — EV Rules & Subsidies
              </h2>
              <p className="text-gw-400 text-sm">
                {detecting
                  ? "Detecting your location..."
                  : detected
                  ? `Auto-detected: ${selectedState}. Change if incorrect.`
                  : "Select your state to see local EV rules and subsidies."}
              </p>
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="input w-full md:w-56 bg-gw-900">
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* State Subsidy Table */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["🏍️ Two-Wheeler Subsidy",    stateInfo.twoWheeler],
              ["🛺 Three-Wheeler Subsidy",  stateInfo.threeWheeler],
              ["🚗 Four-Wheeler Subsidy",   stateInfo.fourWheeler],
              ["🛣️ Road Tax",               stateInfo.roadTax],
              ["📋 Registration Fee",       stateInfo.registration],
            ].map(([label, value]) => (
              <div key={label}
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/50 rounded-xl px-4 py-3 flex justify-between
                           items-center gap-4">
                <span className="text-gw-300 text-sm">{label}</span>
                <span className="text-lime-400 font-bold text-sm text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #14532d" }}
            className="mt-3 bg-gw-900/30 rounded-xl px-4 py-3">
            <p className="text-gw-300 text-sm">
              <span className="text-white font-semibold">ℹ️ Note: </span>
              {stateInfo.extra}
            </p>
          </div>
        </div>

        {/* Central Rules */}
        <div className="card mb-6">
          <h2 className="font-black text-2xl text-white mb-4">
            🇮🇳 Central Government Rules (All India)
          </h2>
          <p className="text-gw-300 leading-relaxed mb-3">
            These rules apply to every Indian citizen regardless of state:
          </p>
          <div className="flex flex-col gap-2">
            {[
              "Registration fees are fully waived for ALL electric vehicles nationwide — MoRTH order August 2021.",
              "Only ARAI or ICAT approved retrofit kits are legal. Dealers must use certified kits only.",
              "Form 22C must be submitted to local RTO for prior approval before any retrofit begins.",
              "RTO must respond within 7 working days. No response = approval deemed granted by law.",
              "After retrofit, RC is updated with Electric as the fuel type by the RTO.",
              "FAME-II central subsidies apply nationwide on eligible EV models and retrofit kits.",
              "GST on EV retrofit kits reduced to 5% (down from 28%) to make conversions affordable.",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-3">
                <span className="text-lime-400 text-sm shrink-0 mt-0.5">✓</span>
                <span className="text-gw-300 text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RTO Process */}
        <div className="card mb-6">
          <h2 className="font-black text-2xl text-white mb-4">
            🏛️ RTO Approval Process (Form 22C)
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { step: "01", title: "Submit Form 22C — Part I",
                desc: "Vehicle owner submits Form 22C Part I to local RTO requesting permission for retrofit. Our dealers assist with this paperwork." },
              { step: "02", title: "RTO Reviews — 7 Working Days",
                desc: "RTO must approve or reject within 7 working days. If no response, approval is automatically granted by law (Rule 47A, CMVR 1989)." },
              { step: "03", title: "Retrofit at Approved Centre",
                desc: "Vehicle retrofitted at our dealer — an Electric Retro-fitment Centre (ERFC) — using ARAI/ICAT approved kit only." },
              { step: "04", title: "Post-Retrofit Inspection",
                desc: "Vehicle undergoes safety and performance inspection to confirm it meets road standards before delivery." },
              { step: "05", title: "RC Updated",
                desc: "RTO endorses new fuel type (Electric) on your Registration Certificate. Your vehicle is now a fully legal EV." },
            ].map((s) => (
              <div key={s.step}
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/50 rounded-xl px-4 py-3 flex items-start gap-4">
                <span className="font-black text-sm text-lime-400 w-6 shrink-0 mt-0.5">
                  {s.step}
                </span>
                <div>
                  <div className="font-bold text-white text-sm">{s.title}</div>
                  <div className="text-gw-400 text-sm">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retrofit Costs */}
        <div className="card mb-6">
          <h2 className="font-black text-2xl text-white mb-4">
            💰 Approximate Retrofit Costs in India (2025)
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: "🛺", type: "Auto-Rickshaw (3-Wheeler)",
                range: "₹50,000 – ₹2,50,000",
                note: "Most affordable. Save ₹3,000–5,000/month vs CNG. ROI in 6–12 months." },
              { icon: "🏍️", type: "Bike / Scooter (2-Wheeler)",
                range: "₹1,00,000 – ₹3,00,000",
                note: "Popular for daily commuters. Cost recoverable in 12–18 months." },
              { icon: "🚗", type: "Car (4-Wheeler)",
                range: "₹3,00,000 – ₹9,00,000",
                note: "Hatchbacks and small cars. Saves vehicle from scrappage policy." },
            ].map((v) => (
              <div key={v.type}
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/50 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-2xl shrink-0">{v.icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">{v.type}</div>
                  <div className="text-lime-400 font-bold text-sm">{v.range}</div>
                  <div className="text-gw-400 text-xs mt-1">{v.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12 Phases */}
        <div className="card mb-6">
          <h2 className="font-black text-2xl text-white mb-6">
            📋 Our 12-Phase Order Process
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { phase:"01", title:"Pending",                  desc:"Submit retrofit inquiry — no payment needed yet." },
              { phase:"02", title:"Dealer Approved",           desc:"Dealer accepts your inquiry and schedules verification." },
              { phase:"03", title:"Verification In Progress",  desc:"Verifier visits your location for on-site inspection." },
              { phase:"3F", title:"Verification Failed",       desc:"Vehicle rejected — order cancelled, zero rupees lost.", fail:true },
              { phase:"04", title:"Verification Passed",       desc:"Vehicle approved — pay 30% token amount now." },
              { phase:"05", title:"Token Payment Done",        desc:"Token paid — dealer schedules vehicle pickup." },
              { phase:"06", title:"Vehicle Picked Up",         desc:"Vehicle collected from your location." },
              { phase:"07", title:"Under Process",             desc:"Retrofit work in progress at dealer workshop." },
              { phase:"08", title:"Ready to Deliver",          desc:"Retrofit complete — final 70% payment requested." },
              { phase:"09", title:"Final Payment Done",        desc:"Balance paid — vehicle dispatched to you." },
              { phase:"10", title:"Delivered",                 desc:"Vehicle delivered — GST invoice auto-generated." },
              { phase:"11", title:"Settlement Pending",        desc:"Awaiting dealer commission transfer to admin." },
              { phase:"12", title:"Completed & Closed",        desc:"Commission received — order permanently closed." },
            ].map((p) => (
              <div key={p.phase}
                style={{ border:`1px solid ${p.fail ? "#7f1d1d" : "#14532d"}` }}
                className={`rounded-xl px-4 py-3 flex items-start gap-4
                  ${p.fail ? "bg-red-900/10" : "bg-gw-900/50"}`}>
                <span className={`font-black text-sm mt-0.5 w-6 shrink-0
                  ${p.fail ? "text-red-400" : "text-lime-400"}`}>
                  {p.phase}
                </span>
                <div>
                  <div className={`font-bold text-sm
                    ${p.fail ? "text-red-400" : "text-white"}`}>
                    {p.title}
                  </div>
                  <div className="text-gw-400 text-sm">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Policy */}
        <div className="card mb-6">
          <h2 className="font-black text-2xl text-white mb-4">
            💳 Payment & Refund Policy
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { icon:"✅", title:"Verification Fails — Zero Loss",
                desc:"Order cancelled before any payment. You lose absolutely nothing." },
              { icon:"✅", title:"Cancel Before Pickup (Phases 1–5)",
                desc:"100% full token refund via Razorpay within 5–7 business days." },
              { icon:"⚠️", title:"Cancel After Pickup (Phase 6)",
                desc:"Token minus 3% refunded. 3% covers dealer pickup and logistics cost." },
              { icon:"❌", title:"Cancel After Phase 6",
                desc:"No cancellation once retrofit work has started." },
              { icon:"📄", title:"Auto GST Invoice",
                desc:"GST-compliant PDF invoice auto-generated after final payment. Downloadable forever." },
            ].map((item) => (
              <div key={item.title}
                style={{ border:"1px solid #14532d" }}
                className="bg-gw-900/50 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">{item.title}</div>
                  <div className="text-gw-400 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="/retrofit" className="btn-primary text-base py-4 px-8">
            Start Retrofit Inquiry →
          </Link>
        </div>

      </section>
    </main>
  );
}