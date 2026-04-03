"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingDots from "@/components/LoadingDots";

const CATEGORIES = [
  { key: "kit",       label: "EV Conversion Kit"    },
  { key: "battery",   label: "Battery"              },
  { key: "motor",     label: "Motor & Controller"   },
  { key: "charger",   label: "Charger & Cable"      },
  { key: "safety",    label: "Safety Equipment"     },
  { key: "accessory", label: "Accessory"            },
];

const VEHICLES = [
  { key: "car",  label: "Car"          },
  { key: "bike", label: "Bike/Scooter" },
  { key: "auto", label: "Auto-Rickshaw"},
];

export default function AddProductPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    name:          "",
    brand:         "",
    category:      "",
    vehicle:       [] as string[],
    price:         "",
    mrp:           "",
    stock:         "",
    description:   "",
    images:        [] as string[],
    araiApproved:  false,
    araiCertNo:    "",
    bisApproved:   false,
    bisCertNo:     "",
    hsnCode:       "",
    warranty:      "",
    countryOfOrigin: "India",
    specs:         [{ label: "", value: "" }],
  });

  async function handleImageUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB."); return; }
    setUploadingImg(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", "product");
      const res  = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) { setError(json.message); return; }
      setForm(p => ({ ...p, images: [...p.images, json.url] }));
    } catch { setError("Upload failed."); }
    finally { setUploadingImg(false); }
  }

  function addSpec() {
    setForm(p => ({
      ...p, specs: [...p.specs, { label: "", value: "" }]
    }));
  }

  function updateSpec(i: number, field: "label"|"value", val: string) {
    const specs = [...form.specs];
    specs[i][field] = val;
    setForm(p => ({ ...p, specs }));
  }

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      if (!form.name || !form.brand || !form.category ||
          !form.price || !form.mrp || !form.description) {
        setError("All required fields must be filled."); return;
      }
      if (form.vehicle.length === 0) {
        setError("Select at least one compatible vehicle type."); return;
      }
      if (Number(form.price) > Number(form.mrp)) {
        setError("Selling price cannot be more than MRP."); return;
      }

      const res  = await fetch("/api/vendor/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          price: Number(form.price),
          mrp:   Number(form.mrp),
          stock: Number(form.stock) || 0,
          specs: form.specs.filter(s => s.label && s.value),
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      router.push("/vendor/products");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-2xl mx-auto">

        <div className="mb-8">
          <Link href="/vendor/products"
            className="text-gw-500 text-sm hover:text-white
                       transition-colors mb-2 block">
            ← Back to Products
          </Link>
          <div className="badge-green inline-block mb-3">Add Product</div>
          <h1 className="font-black text-3xl text-white">
            List a New Product
          </h1>
        </div>

        <div className="card flex flex-col gap-4">

          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Basic info */}
          <h3 className="font-bold text-white text-sm border-b
                         border-gw-800 pb-2">
            📦 Product Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input className="input" placeholder="e.g. Bosch 10kW EV Kit"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}/>
            </div>
            <div>
              <label className="label">Brand *</label>
              <input className="input" placeholder="e.g. Bosch"
                value={form.brand}
                onChange={e => setForm({...form, brand: e.target.value})}/>
            </div>
          </div>

          <div>
            <label className="label">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.key} type="button"
                  onClick={() => setForm({...form, category: cat.key})}
                  style={{
                    border: `1px solid ${form.category === cat.key
                      ? "#a3e635" : "#14532d"}`,
                    background: form.category === cat.key
                      ? "#a3e63510" : "transparent",
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium
                             transition-all">
                  <span className={form.category === cat.key
                    ? "text-lime-400" : "text-gw-300"}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Compatible Vehicles *</label>
            <div className="flex gap-3">
              {VEHICLES.map(v => (
                <button key={v.key} type="button"
                  onClick={() => setForm(p => ({
                    ...p,
                    vehicle: p.vehicle.includes(v.key)
                      ? p.vehicle.filter(x => x !== v.key)
                      : [...p.vehicle, v.key],
                  }))}
                  style={{
                    border: `2px solid ${form.vehicle.includes(v.key)
                      ? "#a3e635" : "#14532d"}`,
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold
                    transition-all ${form.vehicle.includes(v.key)
                      ? "bg-lime-400/10 text-lime-400"
                      : "text-gw-400"
                    }`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <h3 className="font-bold text-white text-sm border-b
                         border-gw-800 pb-2 mt-2">
            💰 Pricing & Stock
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input className="input" type="number"
                placeholder="e.g. 150000"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}/>
            </div>
            <div>
              <label className="label">MRP (₹) *</label>
              <input className="input" type="number"
                placeholder="e.g. 180000"
                value={form.mrp}
                onChange={e => setForm({...form, mrp: e.target.value})}/>
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input className="input" type="number"
                placeholder="e.g. 10"
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}/>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea className="input min-h-[100px] resize-none"
              placeholder="Describe your product..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}/>
          </div>

          {/* Images */}
          <div>
            <label className="label">Product Images</label>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Product ${i+1}`}
                      className="w-20 h-20 object-cover rounded-xl"/>
                    <button
                      onClick={() => setForm(p => ({
                        ...p, images: p.images.filter((_,j) => j !== i)
                      }))}
                      className="absolute -top-1 -right-1 w-5 h-5
                                 bg-red-500 rounded-full text-white
                                 text-xs flex items-center justify-center">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ border: "2px dashed #14532d" }}
              className={`flex flex-col items-center justify-center
                h-20 rounded-xl cursor-pointer bg-gw-900/50 text-xs
                text-gw-500 transition-all
                ${uploadingImg ? "opacity-60" : ""}`}>
              {uploadingImg ? "Uploading..." : "📷 Upload product image"}
              <input type="file" accept="image/*"
                className="hidden" disabled={uploadingImg}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                }}/>
            </label>
          </div>

          {/* Certifications */}
          <h3 className="font-bold text-white text-sm border-b
                         border-gw-800 pb-2 mt-2">
            🛡️ Certifications
          </h3>

          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/20 rounded-xl p-4">

            {/* ARAI */}
            <div className="flex items-center gap-3 mb-3">
              <button type="button"
                onClick={() => setForm(p => ({
                  ...p, araiApproved: !p.araiApproved
                }))}
                style={{
                  width:"20px",height:"20px",borderRadius:"5px",
                  border:form.araiApproved?"2px solid #a3e635":"2px solid #14532d",
                  background:form.araiApproved?"#a3e63520":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",flexShrink:0,
                }}>
                {form.araiApproved && (
                  <span style={{color:"#a3e635",fontSize:"12px",fontWeight:900}}>
                    ✓
                  </span>
                )}
              </button>
              <span className="text-white text-sm font-bold">
                ARAI/ICAT Approved
              </span>
            </div>
            {form.araiApproved && (
              <input className="input mb-4" placeholder="ARAI Certificate No."
                value={form.araiCertNo}
                onChange={e => setForm({...form, araiCertNo: e.target.value})}/>
            )}

            {/* BIS */}
            <div className="flex items-center gap-3 mb-3">
              <button type="button"
                onClick={() => setForm(p => ({
                  ...p, bisApproved: !p.bisApproved
                }))}
                style={{
                  width:"20px",height:"20px",borderRadius:"5px",
                  border:form.bisApproved?"2px solid #a3e635":"2px solid #14532d",
                  background:form.bisApproved?"#a3e63520":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",flexShrink:0,
                }}>
                {form.bisApproved && (
                  <span style={{color:"#a3e635",fontSize:"12px",fontWeight:900}}>
                    ✓
                  </span>
                )}
              </button>
              <span className="text-white text-sm font-bold">
                BIS Certified
              </span>
            </div>
            {form.bisApproved && (
              <input className="input" placeholder="BIS Certificate No."
                value={form.bisCertNo}
                onChange={e => setForm({...form, bisCertNo: e.target.value})}/>
            )}
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">HSN Code</label>
              <input className="input" placeholder="e.g. 8501"
                value={form.hsnCode}
                onChange={e => setForm({...form, hsnCode: e.target.value})}/>
            </div>
            <div>
              <label className="label">Warranty</label>
              <input className="input" placeholder="e.g. 2 years"
                value={form.warranty}
                onChange={e => setForm({...form, warranty: e.target.value})}/>
            </div>
            <div>
              <label className="label">Country of Origin</label>
              <input className="input" placeholder="e.g. India"
                value={form.countryOfOrigin}
                onChange={e => setForm({...form, countryOfOrigin: e.target.value})}/>
            </div>
          </div>

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Specifications</label>
              <button onClick={addSpec}
                className="text-lime-400 text-xs hover:text-white
                           transition-colors">
                + Add Spec
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input className="input text-sm"
                    placeholder="Label (e.g. Motor Power)"
                    value={spec.label}
                    onChange={e => updateSpec(i, "label", e.target.value)}/>
                  <input className="input text-sm"
                    placeholder="Value (e.g. 10 kW)"
                    value={spec.value}
                    onChange={e => updateSpec(i, "value", e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full mt-2"
            onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><span>Submitting</span> <LoadingDots /></>
              : "Submit for Review →"
            }
          </button>

        </div>
      </section>
    </main>
  );
}