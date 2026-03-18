"use client";
import { useState, useEffect } from "react";

type Vendor = {
  _id:          string;
  name:         string;
  email:        string;
  phone:        string;
  businessName: string;
  businessType: string;
  gstNumber:    string;
  gstDocument:  string;
  tradeLicenseDoc?: string;
  araiApproval?:    string;
  araiApprovalDoc?: string;
  productCategories: string[];
  address: { street: string; city: string; state: string; pincode: string };
  status:   "pending" | "approved" | "rejected";
  createdAt: string;
};

const STATUS_COLORS = {
  pending:  "text-yellow-400 border-yellow-700 bg-yellow-900/20",
  approved: "text-lime-400 border-lime-700 bg-lime-900/20",
  rejected: "text-red-400 border-red-700 bg-red-900/20",
};

export default function AdminVendorsPage() {
  const [vendors, setVendors]   = useState<Vendor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all"|"pending"|"approved"|"rejected">("pending");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [acting, setActing]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { loadVendors(); }, [filter]);

  async function loadVendors() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/vendors?status=${filter}`);
      const data = await res.json();
      if (data.success) setVendors(data.vendors);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleAction(vendorId: string, action: "approve"|"reject") {
    if (action === "reject" && !rejectionNote.trim()) {
      setError("Please provide a rejection reason."); return;
    }
    setActing(true); setError("");
    try {
      const res  = await fetch("/api/admin/vendors", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ vendorId, action, rejectionReason: rejectionNote }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      setRejectionNote("");
      loadVendors();
    } catch { setError("Something went wrong."); }
    finally { setActing(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              Vendor Management
            </h1>
          </div>
          <button onClick={loadVendors}
            className="btn-secondary text-sm py-2 px-4">
            🔄 Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["pending","approved","rejected","all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold
                capitalize transition-all
                ${filter === f
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : vendors.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No {filter} vendors found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {vendors.map(vendor => (
              <div key={vendor._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-white text-lg">
                        {vendor.businessName}
                      </h3>
                      <span style={{ border: "1px solid" }}
                        className={`text-xs px-2 py-0.5 rounded-lg
                          capitalize ${STATUS_COLORS[vendor.status]}`}>
                        {vendor.status}
                      </span>
                    </div>
                    <p className="text-gw-400 text-sm">
                      {vendor.name} — {vendor.businessType}
                    </p>
                    <p className="text-gw-500 text-xs mt-1">
                      {vendor.email} · {vendor.phone}
                    </p>
                    <p className="text-gw-600 text-xs mt-1">
                      GST: {vendor.gstNumber} ·{" "}
                      {vendor.address.city}, {vendor.address.state}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vendor.productCategories.map(cat => (
                        <span key={cat}
                          style={{ border: "1px solid #14532d" }}
                          className="text-xs text-gw-400 px-2 py-0.5
                                     rounded-lg bg-gw-900">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setSelected(vendor)}
                      className="btn-secondary text-xs py-2 px-4">
                      View Details
                    </button>
                    {vendor.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(vendor._id, "approve")}
                          disabled={acting}
                          className="btn-primary text-xs py-2 px-4">
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => setSelected(vendor)}
                          disabled={acting}
                          className="text-xs py-2 px-4 rounded-xl
                            border border-red-700/50 text-red-400
                            hover:bg-red-900/20 transition-all">
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center
                          justify-center bg-black/70 px-4 py-8
                          overflow-y-auto">
            <div style={{ border: "1px solid #14532d" }}
              className="bg-gw-950 rounded-2xl p-6 max-w-2xl
                         w-full my-auto">

              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-xl text-white">
                  {selected.businessName}
                </h2>
                <button onClick={() => {
                  setSelected(null);
                  setRejectionNote("");
                  setError("");
                }}
                  className="text-gw-500 hover:text-white text-xl">
                  ✕
                </button>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50
                                text-red-400 text-sm rounded-xl
                                px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Owner",         value: selected.name },
                    { label: "Phone",         value: selected.phone },
                    { label: "Email",         value: selected.email },
                    { label: "Business Type", value: selected.businessType },
                    { label: "GST Number",    value: selected.gstNumber },
                    { label: "Address",       value: `${selected.address.city}, ${selected.address.state}` },
                  ].map(item => (
                    <div key={item.label}
                      style={{ border: "1px solid #14532d" }}
                      className="bg-gw-900/30 rounded-xl px-3 py-2">
                      <p className="text-gw-500 text-xs mb-0.5">{item.label}</p>
                      <p className="text-white text-sm font-semibold">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div>
                  <p className="text-gw-500 text-xs mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={selected.gstDocument} target="_blank"
                      className="btn-secondary text-xs py-2 px-3">
                      📄 GST Certificate ↗
                    </a>
                    {selected.tradeLicenseDoc && (
                      <a href={selected.tradeLicenseDoc} target="_blank"
                        className="btn-secondary text-xs py-2 px-3">
                        📄 Trade License ↗
                      </a>
                    )}
                    {selected.araiApprovalDoc && (
                      <a href={selected.araiApprovalDoc} target="_blank"
                        className="btn-secondary text-xs py-2 px-3">
                        ⚡ ARAI Approval ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* ARAI status */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gw-500 text-xs">
                      ARAI/ICAT Certification
                    </span>
                    <span className={`text-xs font-bold ${
                      selected.araiApproval
                        ? "text-lime-400" : "text-yellow-400"
                    }`}>
                      {selected.araiApproval
                        ? `✅ ${selected.araiApproval}`
                        : "⚠️ Not provided"}
                    </span>
                  </div>
                </div>

                {/* Product categories */}
                <div>
                  <p className="text-gw-500 text-xs mb-2">
                    Product Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.productCategories.map(cat => (
                      <span key={cat}
                        style={{ border: "1px solid #14532d" }}
                        className="text-xs text-lime-400 px-2 py-1
                                   rounded-lg bg-gw-900">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rejection note */}
                {selected.status === "pending" && (
                  <div>
                    <label className="label">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Tell the vendor why they were rejected..."
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                    />
                  </div>
                )}

                {selected.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selected._id, "approve")}
                      disabled={acting}
                      className="btn-primary flex-1">
                      {acting ? "Processing..." : "✅ Approve Vendor"}
                    </button>
                    <button
                      onClick={() => handleAction(selected._id, "reject")}
                      disabled={acting}
                      style={{ border: "1px solid #991b1b" }}
                      className="flex-1 py-3 rounded-xl text-red-400
                        hover:bg-red-900/20 transition-all font-bold">
                      {acting ? "Processing..." : "❌ Reject Vendor"}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}