"use client";
import { useState, useEffect } from "react";

type Product = {
  _id:          string;
  name:         string;
  brand:        string;
  vendorName:   string;
  category:     string;
  price:        number;
  mrp:          number;
  stock:        number;
  description:  string;
  images:       string[];
  araiApproved: boolean;
  araiCertNo:   string;
  bisApproved:  boolean;
  vehicle:      string[];
  isApproved:   boolean;
  warranty:     string;
  hsnCode:      string;
  countryOfOrigin: string;
  specs:        { label: string; value: string }[];
  createdAt:    string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("pending");
  const [selected, setSelected] = useState<Product | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [acting, setActing]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { loadProducts(); }, [filter]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/products?filter=${filter}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleAction(productId: string, action: "approve"|"reject") {
    if (action === "reject" && !rejectionNote.trim()) {
      setError("Please provide a rejection reason."); return;
    }
    setActing(true); setError("");
    try {
      const res  = await fetch("/api/admin/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId, action,
          rejectionReason: rejectionNote,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      setRejectionNote("");
      loadProducts();
    } catch { setError("Something went wrong."); }
    finally { setActing(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              Product Approvals
            </h1>
          </div>
          <button onClick={loadProducts}
            className="btn-secondary text-sm py-2 px-4">
            🔄 Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["pending","approved","all"] as const).map(f => (
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
        ) : products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No {filter} products.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map(product => (
              <div key={product._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"/>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-black text-white text-base">
                          {product.name}
                        </h3>
                        {product.araiApproved && (
                          <span style={{ border: "1px solid #14532d" }}
                            className="text-xs text-lime-400 px-2 py-0.5
                                       rounded-lg bg-gw-900">
                            ✅ ARAI
                          </span>
                        )}
                      </div>
                      <p className="text-gw-400 text-sm">
                        {product.brand} · {product.category} ·
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-gw-600 text-xs mt-1">
                        Vendor: {product.vendorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setSelected(product)}
                      className="btn-secondary text-xs py-2 px-4">
                      Review
                    </button>
                    {!product.isApproved && (
                      <>
                        <button
                          onClick={() => handleAction(product._id, "approve")}
                          disabled={acting}
                          className="btn-primary text-xs py-2 px-4">
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => setSelected(product)}
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
                  {selected.name}
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

                {/* Images */}
                {selected.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {selected.images.map((url, i) => (
                      <img key={i} src={url} alt={`${i+1}`}
                        className="w-24 h-24 object-cover rounded-xl shrink-0"/>
                    ))}
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Brand",    value: selected.brand    },
                    { label: "Category", value: selected.category },
                    { label: "Price",    value: `₹${selected.price.toLocaleString()}` },
                    { label: "MRP",      value: `₹${selected.mrp.toLocaleString()}` },
                    { label: "Stock",    value: String(selected.stock) },
                    { label: "Warranty", value: selected.warranty || "—" },
                    { label: "HSN Code", value: selected.hsnCode  || "—" },
                    { label: "Origin",   value: selected.countryOfOrigin },
                  ].map(item => (
                    <div key={item.label}
                      style={{ border: "1px solid #14532d" }}
                      className="bg-gw-900/30 rounded-xl px-3 py-2">
                      <p className="text-gw-500 text-xs mb-0.5">{item.label}</p>
                      <p className="text-white text-sm font-semibold capitalize">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <p className="text-gw-500 text-xs mb-1">Description</p>
                  <p className="text-white text-sm leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* Certifications */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-gw-500 text-xs mb-1">ARAI/ICAT</p>
                      <p className={`text-sm font-bold ${
                        selected.araiApproved ? "text-lime-400" : "text-yellow-400"
                      }`}>
                        {selected.araiApproved
                          ? `✅ ${selected.araiCertNo || "Certified"}`
                          : "⚠️ Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gw-500 text-xs mb-1">BIS</p>
                      <p className={`text-sm font-bold ${
                        selected.bisApproved ? "text-lime-400" : "text-yellow-400"
                      }`}>
                        {selected.bisApproved ? "✅ Certified" : "⚠️ Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                {selected.specs?.length > 0 && (
                  <div>
                    <p className="text-gw-500 text-xs mb-2">Specifications</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.specs.map((spec, i) => (
                        <div key={i}
                          style={{ border: "1px solid #14532d" }}
                          className="bg-gw-900/30 rounded-xl px-3 py-2">
                          <p className="text-gw-500 text-xs">{spec.label}</p>
                          <p className="text-white text-sm font-semibold">
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection note */}
                {!selected.isApproved && (
                  <div>
                    <label className="label">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Tell the vendor why this product was rejected..."
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                    />
                  </div>
                )}

                {/* Actions */}
                {!selected.isApproved && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selected._id, "approve")}
                      disabled={acting}
                      className="btn-primary flex-1">
                      {acting ? "Processing..." : "✅ Approve Product"}
                    </button>
                    <button
                      onClick={() => handleAction(selected._id, "reject")}
                      disabled={acting}
                      style={{ border: "1px solid #991b1b" }}
                      className="flex-1 py-3 rounded-xl text-red-400
                        hover:bg-red-900/20 transition-all font-bold">
                      {acting ? "Processing..." : "❌ Reject"}
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