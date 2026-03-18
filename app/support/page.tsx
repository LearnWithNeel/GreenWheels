"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingDots from "@/components/LoadingDots";

// ── Step 1 categories ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key:      "dealer",
    icon:     "🔧",
    label:    "Complaint Against Dealer",
    desc:     "Poor work quality, fake parts, overcharging, misconduct",
    needsAuth: true,
  },
  {
    key:      "vendor",
    icon:     "🏭",
    label:    "Complaint Against Vendor",
    desc:     "Fake products, wrong item delivered, fraud",
    needsAuth: true,
  },
  {
    key:      "payment",
    icon:     "💰",
    label:    "Payment Issue",
    desc:     "Payment deducted, refund not received, wrong charge",
    needsAuth: false,
  },
  {
    key:      "technical",
    icon:     "🌐",
    label:    "Website / Technical Issue",
    desc:     "Login problem, page not loading, upload failing",
    needsAuth: false,
  },
  {
    key:      "order",
    icon:     "📦",
    label:    "Order Issue",
    desc:     "Order not updating, wrong status, missing info",
    needsAuth: true,
  },
  {
    key:      "other",
    icon:     "📋",
    label:    "Other Issue",
    desc:     "Anything not covered above",
    needsAuth: false,
  },
];

// ── Sub-types per category ───────────────────────────────────────────────────
const SUB_TYPES: Record<string, { key: string; label: string }[]> = {
  dealer: [
    { key: "fake_parts",        label: "Using fake/uncertified parts"    },
    { key: "poor_quality",      label: "Poor quality retrofit work"      },
    { key: "vehicle_damaged",   label: "Vehicle damaged at workshop"     },
    { key: "overcharging",      label: "Overcharging / extra fees"       },
    { key: "misconduct",        label: "Unprofessional / rude behavior"  },
    { key: "rto_not_filed",     label: "RTO paperwork not done"          },
    { key: "delay",             label: "Excessive delays"                },
    { key: "other",             label: "Other dealer issue"              },
  ],
  vendor: [
    { key: "fake_product",      label: "Fake / counterfeit product"      },
    { key: "wrong_item",        label: "Wrong item delivered"            },
    { key: "not_delivered",     label: "Item not delivered"              },
    { key: "poor_quality",      label: "Poor product quality"            },
    { key: "fraud",             label: "Payment fraud / scam"            },
    { key: "other",             label: "Other vendor issue"              },
  ],
  payment: [
    { key: "deducted_no_confirm", label: "Payment deducted but not confirmed" },
    { key: "refund_pending",      label: "Refund not received"               },
    { key: "wrong_amount",        label: "Wrong amount charged"              },
    { key: "double_charge",       label: "Charged twice"                     },
    { key: "other",               label: "Other payment issue"               },
  ],
  technical: [
    { key: "login_issue",       label: "Cannot login / OTP not received" },
    { key: "order_not_showing", label: "Order not showing"               },
    { key: "upload_failing",    label: "File upload not working"         },
    { key: "page_error",        label: "Page not loading / error"        },
    { key: "other",             label: "Other technical issue"           },
  ],
  order: [
    { key: "wrong_status",      label: "Order status not updating"       },
    { key: "missing_info",      label: "Missing order information"       },
    { key: "cancelled_wrongly", label: "Order cancelled without reason"  },
    { key: "other",             label: "Other order issue"               },
  ],
  other: [
    { key: "other",             label: "Other"                           },
  ],
};

type Party = {
  _id:          string;
  name:         string;
  garageName?:  string;
  garageAddress?: { city: string };
};

export default function SupportPage() {
  const { data: session } = useSession();
  const [step, setStep]   = useState<1 | 2 | 3>(1);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [parties, setParties]   = useState<Party[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const [form, setForm] = useState({
    complainantName:  (session?.user?.name  || "") as string,
    complainantEmail: (session?.user?.email || "") as string,
    category:         "",
    subType:          "",
    againstId:        "",
    againstName:      "",
    orderNumber:      "",
    subject:          "",
    description:      "",
    evidence:         [] as string[],
    declarationAccepted: false,
  });

  // Load parties when dealer/vendor selected
  useEffect(() => {
    if (form.category === "dealer" || form.category === "vendor") {
      fetch(`/api/complaints/parties?type=${form.category}`)
        .then(r => r.json())
        .then(d => { if (d.success) setParties(d.parties); })
        .catch(() => {});
    }
  }, [form.category]);

  // Auto fill name/email when session loads
  useEffect(() => {
    if (session?.user) {
      setForm(p => ({
        ...p,
        complainantName:  session.user?.name  || p.complainantName,
        complainantEmail: session.user?.email || p.complainantEmail,
      }));
    }
  }, [session]);

  const selectedCategory = CATEGORIES.find(c => c.key === form.category);
  const subTypes = form.category ? SUB_TYPES[form.category] || [] : [];

  // Auto generate subject
  function getAutoSubject() {
    const sub = subTypes.find(s => s.key === form.subType);
    const cat = selectedCategory;
    if (!cat || !sub) return "";
    if (form.againstName) return `${sub.label} — ${form.againstName}`;
    return sub.label;
  }

  async function handleEvidenceUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB."); return; }
    setUploadingEvidence(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", "evidence");
      const res  = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) { setError(json.message); return; }
      setForm(p => ({ ...p, evidence: [...p.evidence, json.url] }));
    } catch { setError("Upload failed."); }
    finally { setUploadingEvidence(false); }
  }

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      if (!form.complainantName || !form.complainantEmail) {
        setError("Name and email are required."); return;
      }
      if (!form.declarationAccepted &&
          (form.category === "dealer" || form.category === "vendor")) {
        setError("Please accept the declaration to proceed."); return;
      }
      if (!form.description) {
        setError("Please describe your complaint."); return;
      }

      const subject = form.subject || getAutoSubject() ||
                      selectedCategory?.label || "Support Request";

      const typeMap: Record<string, string> = {
        dealer:    form.subType === "fake_parts" ? "fake_parts" : "dealer_misconduct",
        vendor:    form.subType === "fraud"      ? "vendor_fraud" : "product_quality",
        payment:   "payment_dispute",
        technical: "other",
        order:     "delivery_issue",
        other:     "other",
      };

      const againstMap: Record<string, string> = {
        dealer:    "dealer",
        vendor:    "vendor",
        payment:   "platform",
        technical: "platform",
        order:     "platform",
        other:     "platform",
      };

      const res  = await fetch("/api/complaints", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          complainantName:     form.complainantName,
          complainantEmail:    form.complainantEmail,
          type:                typeMap[form.category]    || "other",
          against:             againstMap[form.category] || "platform",
          againstId:           form.againstId,
          againstName:         form.againstName,
          orderNumber:         form.orderNumber,
          subject,
          description:         form.description,
          evidence:            form.evidence,
          declarationAccepted: form.declarationAccepted,
          complaintCategory:   form.category,
          complaintSubType:    form.subType,
        }),
      });

      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess(data.message);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="page-wrapper">
        <section className="section max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="font-black text-3xl text-white mb-4">
            Complaint Filed Successfully
          </h1>
          <p className="text-gw-400 text-lg mb-6 max-w-md mx-auto">
            {success}
          </p>
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-black text-white text-lg mb-3">
              What happens next?
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: "📋", text: "Your complaint is logged and assigned a unique ID." },
                { icon: "👤", text: "A support agent will be assigned within 2 hours." },
                { icon: "🔍", text: "Investigation begins — both parties may be contacted." },
                { icon: "⚖️", text: "Verdict within 48 hours for standard, 7 days for complex cases." },
                { icon: "📧", text: "You will be notified via email at every step." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="text-gw-400 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <Link href="/" className="btn-primary">Back to Home →</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="badge-green inline-block mb-3">Support</div>
          <h1 className="font-black text-4xl text-white mb-3">
            File a Complaint
          </h1>
          <p className="text-gw-400 text-sm max-w-lg mx-auto">
            All complaints are private and reviewed by our support team
            within 48 hours.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: step >= s ? "#a3e635" : "#052e16",
                border: `2px solid ${step >= s ? "#a3e635" : "#14532d"}`,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                fontSize: "12px", fontWeight: 900,
                color: step >= s ? "#021a0e" : "#4a7c59",
              }}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: "60px", height: "2px",
                  background: step > s ? "#a3e635" : "#14532d",
                }}/>
              )}
            </div>
          ))}
        </div>

        <div className="card flex flex-col gap-5">

          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* ── STEP 1 — Category ── */}
          {step === 1 && (
            <div>
              <h2 className="font-black text-white text-xl mb-2">
                What is your complaint about?
              </h2>
              <p className="text-gw-500 text-sm mb-5">
                Select the category that best describes your issue.
              </p>
              <div className="flex flex-col gap-3">
                {CATEGORIES.map(cat => {
                  const needsLogin = cat.needsAuth && !session;
                  return (
                    <button key={cat.key} type="button"
                      onClick={() => {
                        if (needsLogin) {
                          setError("Please login to file this type of complaint.");
                          return;
                        }
                        setError("");
                        setForm(p => ({ ...p, category: cat.key, subType: "", againstId: "", againstName: "" }));
                        setStep(2);
                      }}
                      style={{
                        border: `1px solid ${form.category === cat.key ? "#a3e635" : "#14532d"}`,
                        background: needsLogin ? "transparent" : form.category === cat.key ? "#a3e63510" : "#052e1620",
                        opacity: needsLogin ? 0.5 : 1,
                      }}
                      className="flex items-center gap-4 px-4 py-4
                                 rounded-xl text-left transition-all
                                 hover:border-lime-700/50 group">
                      <span className="text-3xl shrink-0">{cat.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm mb-0.5
                                      group-hover:text-lime-400 transition-colors">
                          {cat.label}
                        </p>
                        <p className="text-gw-500 text-xs">{cat.desc}</p>
                      </div>
                      {needsLogin && (
                        <span style={{ border: "1px solid #14532d" }}
                          className="text-xs text-gw-500 px-2 py-1
                                     rounded-lg shrink-0">
                          Login required
                        </span>
                      )}
                      <span className="text-gw-700 group-hover:text-gw-400
                                       transition-colors text-lg">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2 — Sub-type + Party ── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)}
                className="text-gw-500 text-sm hover:text-white
                           transition-colors mb-4 flex items-center gap-1">
                ← Back
              </button>

              <h2 className="font-black text-white text-xl mb-2">
                {selectedCategory?.icon} {selectedCategory?.label}
              </h2>
              <p className="text-gw-500 text-sm mb-5">
                Tell us more specifically what happened.
              </p>

              {/* Sub type */}
              <div className="mb-5">
                <label className="label">What specifically happened? *</label>
                <div className="flex flex-col gap-2">
                  {subTypes.map(sub => (
                    <button key={sub.key} type="button"
                      onClick={() => setForm(p => ({
                        ...p, subType: sub.key
                      }))}
                      style={{
                        border: `1px solid ${form.subType === sub.key ? "#a3e635" : "#14532d"}`,
                        background: form.subType === sub.key ? "#a3e63510" : "transparent",
                      }}
                      className="flex items-center gap-3 px-4 py-3
                                 rounded-xl text-left transition-all">
                      <div style={{
                        width: "16px", height: "16px", borderRadius: "4px",
                        border: `2px solid ${form.subType === sub.key ? "#a3e635" : "#14532d"}`,
                        background: form.subType === sub.key ? "#a3e63520" : "transparent",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px", color: "#a3e635", flexShrink: 0,
                      }}>
                        {form.subType === sub.key && "✓"}
                      </div>
                      <span className={`text-sm font-medium ${
                        form.subType === sub.key ? "text-lime-400" : "text-gw-300"
                      }`}>
                        {sub.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select dealer/vendor from dropdown */}
              {(form.category === "dealer" || form.category === "vendor") && (
                <div className="mb-5">
                  <label className="label">
                    Select the {form.category} *
                  </label>
                  <p className="text-gw-600 text-xs mb-2">
                    Only verified {form.category}s are shown.
                    Select the one your complaint is against.
                  </p>
                  <select className="input"
                    value={form.againstId}
                    onChange={e => {
                      const party = parties.find(p => p._id === e.target.value);
                      setForm(prev => ({
                        ...prev,
                        againstId:   e.target.value,
                        againstName: party
                          ? (party.garageName || party.name)
                          : "",
                      }));
                    }}>
                    <option value="">
                      Select {form.category}...
                    </option>
                    {parties.map(party => (
                      <option key={party._id} value={party._id}>
                        {party.garageName || party.name}
                        {party.garageAddress?.city
                          ? ` — ${party.garageAddress.city}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Order number */}
              {(form.category === "dealer" || form.category === "order") && (
                <div className="mb-5">
                  <label className="label">
                    Order Number
                    {form.category === "dealer" ? " * (required)" : " (optional)"}
                  </label>
                  <input className="input"
                    placeholder="e.g. GW-20260315-0001"
                    value={form.orderNumber}
                    onChange={e => setForm({
                      ...form, orderNumber: e.target.value
                    })}/>
                  {form.category === "dealer" && (
                    <p className="text-gw-600 text-xs mt-1">
                      Required to verify your interaction with this dealer.
                    </p>
                  )}
                </div>
              )}

              <button
                className="btn-primary w-full"
                onClick={() => {
                  setError("");
                  if (!form.subType) {
                    setError("Please select what specifically happened."); return;
                  }
                  if ((form.category === "dealer" || form.category === "vendor")
                      && !form.againstId) {
                    setError(`Please select the ${form.category}.`); return;
                  }
                  if (form.category === "dealer" && !form.orderNumber) {
                    setError("Order number is required for dealer complaints."); return;
                  }
                  setStep(3);
                }}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 3 — Details + Submit ── */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)}
                className="text-gw-500 text-sm hover:text-white
                           transition-colors mb-4 flex items-center gap-1">
                ← Back
              </button>

              <h2 className="font-black text-white text-xl mb-2">
                Complaint Details
              </h2>

              {/* Summary badge */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3 mb-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-gw-500 text-xs">Category:</span>
                  <span style={{ border: "1px solid #14532d" }}
                    className="text-xs text-lime-400 px-2 py-0.5
                               rounded-lg bg-gw-900 font-bold">
                    {selectedCategory?.icon} {selectedCategory?.label}
                  </span>
                  {form.subType && (
                    <>
                      <span className="text-gw-700 text-xs">→</span>
                      <span style={{ border: "1px solid #14532d" }}
                        className="text-xs text-gw-300 px-2 py-0.5
                                   rounded-lg bg-gw-900">
                        {subTypes.find(s => s.key === form.subType)?.label}
                      </span>
                    </>
                  )}
                  {form.againstName && (
                    <>
                      <span className="text-gw-700 text-xs">→</span>
                      <span style={{ border: "1px solid #14532d" }}
                        className="text-xs text-gw-300 px-2 py-0.5
                                   rounded-lg bg-gw-900">
                        {form.againstName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Your info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input className="input" placeholder="Full name"
                    value={form.complainantName}
                    onChange={e => setForm({
                      ...form, complainantName: e.target.value
                    })}/>
                </div>
                <div>
                  <label className="label">Your Email *</label>
                  <input className="input" type="email"
                    value={form.complainantEmail}
                    onChange={e => setForm({
                      ...form, complainantEmail: e.target.value
                    })}/>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="label">
                  Describe your complaint in detail *
                </label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="Include dates, amounts, what happened exactly, and any other relevant details..."
                  value={form.description}
                  onChange={e => setForm({
                    ...form, description: e.target.value
                  })}/>
              </div>

              {/* Evidence */}
              <div className="mb-5">
                <label className="label">
                  Upload Evidence (Optional)
                </label>
                {form.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.evidence.map((url, i) => (
                      <div key={i}
                        style={{ border: "1px solid #14532d" }}
                        className="flex items-center gap-2 bg-gw-900
                                   rounded-lg px-3 py-1.5">
                        <span className="text-lime-400 text-xs">
                          📎 File {i + 1}
                        </span>
                        <a href={url} target="_blank"
                          className="text-gw-500 text-xs hover:text-white">
                          View
                        </a>
                        <button
                          onClick={() => setForm(p => ({
                            ...p,
                            evidence: p.evidence.filter((_, j) => j !== i),
                          }))}
                          className="text-red-400 text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <label
                  style={{ border: "2px dashed #14532d" }}
                  className={`flex flex-col items-center justify-center
                    h-20 rounded-xl cursor-pointer hover:border-gw-500
                    bg-gw-900/50 transition-all
                    ${uploadingEvidence ? "opacity-60 cursor-wait" : ""}`}>
                  {uploadingEvidence ? (
                    <span className="text-gw-400 text-sm">Uploading...</span>
                  ) : (
                    <>
                      <span className="text-xl mb-1">📎</span>
                      <span className="text-gw-400 text-xs">
                        Photo, PDF or screenshot — max 10MB
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*,.pdf"
                    className="hidden" disabled={uploadingEvidence}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleEvidenceUpload(f);
                    }}/>
                </label>
              </div>

              {/* Declaration — only for dealer/vendor */}
              {(form.category === "dealer" || form.category === "vendor") && (
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-4 mb-5">
                  <div className="flex items-start gap-3">
                    <button type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        declarationAccepted: !p.declarationAccepted,
                      }))}
                      style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        flexShrink: 0,
                        border: form.declarationAccepted
                          ? "2px solid #a3e635" : "2px solid #14532d",
                        background: form.declarationAccepted
                          ? "#a3e63520" : "transparent",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer", marginTop: "1px",
                      }}>
                      {form.declarationAccepted && (
                        <span style={{
                          color: "#a3e635", fontSize: "13px", fontWeight: 900,
                        }}>✓</span>
                      )}
                    </button>
                    <p className="text-gw-400 text-xs leading-relaxed">
                      <span className="text-white font-bold">
                        Declaration: *{" "}
                      </span>
                      I confirm that this complaint is genuine and based
                      on real experience. I understand that filing false
                      or malicious complaints is a violation of
                      GreenWheels Terms of Service and may result in
                      account suspension or legal action.
                    </p>
                  </div>
                </div>
              )}

              {/* Privacy note */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3 mb-5">
                <p className="text-gw-400 text-xs leading-relaxed">
                  <span className="text-white font-semibold">
                    🔒 Privacy:{" "}
                  </span>
                  Your complaint is completely private. Only our support
                  team and admin can see it. It will never be shown
                  publicly.
                </p>
              </div>

              <button className="btn-primary w-full"
                onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span>Submitting</span> <LoadingDots /></>
                  : "Submit Complaint →"
                }
              </button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}