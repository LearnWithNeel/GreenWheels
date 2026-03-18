"use client";
import { useState, useEffect } from "react";

type Dealer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  garageName: string;
  garageAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  specialization: string[];
  experience: number;
  govtLicenseNo: string;
  govtIdType: string;
  govtLicenseDoc: string;
  profileImage: string;
  workshopPhotos: string[];
  certifications: string[];
  araiKitBrands: string[];
  erfcCertified: boolean;
  erfcCertNo: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string;
  rating: number;
  totalOrders: number;
  createdAt: string;
};

const STATUS_COLORS = {
  pending: "text-yellow-400 border-yellow-700 bg-yellow-900/20",
  approved: "text-lime-400 border-lime-700 bg-lime-900/20",
  rejected: "text-red-400 border-red-700 bg-red-900/20",
};

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<Dealer | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadDealers(); }, [filter]);

  async function loadDealers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dealers?status=${filter}`);
      const data = await res.json();
      if (data.success) setDealers(data.dealers);
    } catch { }
    finally { setLoading(false); }
  }

  async function handleAction(
    dealerId: string,
    action: "approve" | "reject"
  ) {
    if (action === "reject" && !rejectionNote.trim()) {
      setError("Please provide a rejection reason."); return;
    }
    setActing(true); setError("");
    try {
      const res = await fetch("/api/admin/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId,
          action,
          rejectionReason: rejectionNote,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      setRejectionNote("");
      loadDealers();
    } catch { setError("Something went wrong."); }
    finally { setActing(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">
              Admin Panel
            </div>
            <h1 className="font-black text-3xl text-white">
              Dealer Management
            </h1>
          </div>
          <button onClick={loadDealers}
            className="btn-secondary text-sm py-2 px-4">
            🔄 Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
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

        {/* Dealer List */}
        {loading ? (
          <p className="text-gw-400 text-center py-12">
            Loading dealers...
          </p>
        ) : dealers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">
              No {filter} dealers found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {dealers.map(dealer => (
              <div key={dealer._id} className="card">
                <div className="flex items-start justify-between gap-4">

                  {/* Left — Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {dealer.profileImage ? (
                      <img src={dealer.profileImage}
                        alt={dealer.name}
                        className="w-14 h-14 rounded-full object-cover
                                   border-2 border-gw-700 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gw-800
                                      flex items-center justify-center
                                      text-2xl shrink-0">
                        🔧
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white text-lg">
                          {dealer.name}
                        </h3>
                        <span style={{ border: "1px solid" }}
                          className={`text-xs px-2 py-0.5 rounded-lg
                            capitalize ${STATUS_COLORS[dealer.status]}`}>
                          {dealer.status}
                        </span>
                      </div>
                      <p className="text-gw-400 text-sm">
                        {dealer.garageName} — {dealer.garageAddress.city},
                        {" "}{dealer.garageAddress.state}
                      </p>
                      <p className="text-gw-500 text-xs mt-1">
                        {dealer.email} · {dealer.phone}
                      </p>
                      <div className="flex items-center gap-3 mt-2
                                      flex-wrap">
                        {dealer.specialization.map(s => (
                          <span key={s}
                            style={{ border: "1px solid #14532d" }}
                            className="text-xs text-gw-300 px-2 py-0.5
                                       rounded-lg bg-gw-900 capitalize">
                            {s}
                          </span>
                        ))}
                        <span className="text-gw-600 text-xs">
                          {dealer.experience} yrs exp
                        </span>
                        {dealer.govtIdType && (
                          <span className="text-gw-600 text-xs">
                            {dealer.govtIdType}: {dealer.govtLicenseNo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setSelected(dealer)}
                      className="btn-secondary text-xs py-2 px-4">
                      View Details
                    </button>
                    {dealer.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(dealer._id, "approve")}
                          disabled={acting}
                          className="btn-primary text-xs py-2 px-4">
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => setSelected(dealer)}
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
              className="bg-gw-950 rounded-2xl p-6 max-w-2xl w-full
                         my-auto">

              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-xl text-white">
                  {selected.garageName}
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

              {/* Dealer Details */}
              <div className="flex flex-col gap-4">

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gw-500 text-xs">Owner</span>
                    <p className="text-white font-semibold">
                      {selected.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gw-500 text-xs">Phone</span>
                    <p className="text-white font-semibold">
                      {selected.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-gw-500 text-xs">Email</span>
                    <p className="text-white font-semibold">
                      {selected.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gw-500 text-xs">Experience</span>
                    <p className="text-white font-semibold">
                      {selected.experience} years
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gw-500 text-xs">Address</span>
                    <p className="text-white font-semibold">
                      {selected.garageAddress.street},{" "}
                      {selected.garageAddress.city},{" "}
                      {selected.garageAddress.state} —{" "}
                      {selected.garageAddress.pincode}
                    </p>
                  </div>
                  <div>
                    <span className="text-gw-500 text-xs">
                      {selected.govtIdType}
                    </span>
                    <p className="text-white font-semibold">
                      {selected.govtLicenseNo}
                    </p>
                  </div>
                  <div>
                    <span className="text-gw-500 text-xs">
                      Specialization
                    </span>
                    <p className="text-white font-semibold capitalize">
                      {selected.specialization.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Govt License Doc */}
                {selected.govtLicenseDoc && (
                  <div>
                    <span className="text-gw-500 text-xs block mb-1">
                      Government License Document
                    </span>
                    <a href={selected.govtLicenseDoc} target="_blank"
                      className="btn-secondary text-xs py-2 px-4
                                 inline-block">
                      📄 View Document ↗
                    </a>
                  </div>
                )}

                {/* ERFC Status */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gw-500 text-xs">ERFC Certification</span>
                    <span style={{
                      border: `1px solid ${selected.erfcCertified ? "#14532d" : "#991b1b"}`,
                    }}
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold
        ${selected.erfcCertified
                          ? "text-lime-400 bg-lime-900/20"
                          : "text-red-400 bg-red-900/20"
                        }`}>
                      {selected.erfcCertified ? "✅ ERFC Certified" : "❌ Not Certified"}
                    </span>
                  </div>
                  {selected.erfcCertNo && (
                    <p className="text-white text-xs font-semibold">
                      Certificate No: {selected.erfcCertNo}
                    </p>
                  )}
                  {!selected.erfcCertified && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ This dealer has not confirmed ERFC certification.
                      Verify before approving.
                    </p>
                  )}
                </div>

                {/* ARAI Kit Brands */}
                {selected.araiKitBrands?.length > 0 && (
                  <div>
                    <span className="text-gw-500 text-xs block mb-2">
                      ARAI/ICAT Approved Kit Brands
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selected.araiKitBrands.map(brand => (
                        <span key={brand}
                          style={{ border: "1px solid #14532d" }}
                          className="text-xs text-lime-400 px-2 py-1
                     rounded-lg bg-gw-900">
                          ⚡ {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


                {/* Certifications */}
                {selected.certifications?.length > 0 && (
                  <div>
                    <span className="text-gw-500 text-xs block mb-2">
                      Certifications
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selected.certifications.map(c => (
                        <span key={c}
                          style={{ border: "1px solid #14532d" }}
                          className="text-xs text-gw-300 px-2 py-1
                                     rounded-lg bg-gw-900">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workshop Photos */}
                {selected.workshopPhotos?.length > 0 && (
                  <div>
                    <span className="text-gw-500 text-xs block mb-2">
                      Workshop Photos
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.workshopPhotos.map((url, i) => (
                        <a key={i} href={url} target="_blank">
                          <img src={url} alt={`Workshop ${i + 1}`}
                            className="w-full h-24 object-cover
                                       rounded-xl hover:opacity-80
                                       transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Note */}
                {selected.status === "pending" && (
                  <div>
                    <label className="label">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Tell the dealer why their profile was rejected..."
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selected.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selected._id, "approve")}
                      disabled={acting}
                      className="btn-primary flex-1">
                      {acting ? "Processing..." : "✅ Approve Dealer"}
                    </button>
                    <button
                      onClick={() => handleAction(selected._id, "reject")}
                      disabled={acting}
                      style={{ border: "1px solid #991b1b" }}
                      className="flex-1 py-3 rounded-xl text-red-400
                        hover:bg-red-900/20 transition-all font-bold">
                      {acting ? "Processing..." : "❌ Reject Dealer"}
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