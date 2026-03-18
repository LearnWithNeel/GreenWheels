"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingDots from "@/components/LoadingDots";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh",
];

const PRODUCT_CATEGORIES = [
  "EV Conversion Kits",
  "Lithium Batteries",
  "Motors & Controllers",
  "Chargers & Cables",
  "Safety Equipment",
  "EV Accessories",
  "New Electric Vehicles",
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep]   = useState<"form"|"otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [otp, setOtp]         = useState("");

  const [uploadingGst,   setUploadingGst]   = useState(false);
  const [uploadingTrade, setUploadingTrade] = useState(false);
  const [uploadingArai,  setUploadingArai]  = useState(false);

  const [form, setForm] = useState({
    name:         "",
    email:        "",
    password:     "",
    confirmPassword: "",
    phone:        "",
    businessName: "",
    businessType: "",
    gstNumber:    "",
    gstDocument:  "",
    tradeLicense:    "",
    tradeLicenseDoc: "",
    araiApproval:    "",
    araiApprovalDoc: "",
    productCategories: [] as string[],
    bankAccountName:   "",
    bankAccountNumber: "",
    bankIfsc:          "",
    street:   "",
    city:     "",
    state:    "",
    pincode:  "",
    agreedToTerms: false,
  });

  async function handleUpload(
    file: File,
    field: "gstDocument" | "tradeLicenseDoc" | "araiApprovalDoc",
    setStat: (v: boolean) => void
  ) {
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB."); return; }
    setStat(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", field);
      const res  = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) { setError(json.message); return; }
      setForm(p => ({ ...p, [field]: json.url }));
    } catch { setError("Upload failed."); }
    finally { setStat(false); }
  }

  function toggleCategory(cat: string) {
    setForm(p => ({
      ...p,
      productCategories: p.productCategories.includes(cat)
        ? p.productCategories.filter(c => c !== cat)
        : [...p.productCategories, cat],
    }));
  }

  async function handleRegister() {
    setError(""); setLoading(true);
    try {
      if (!form.name || !form.email || !form.password ||
          !form.phone || !form.businessName || !form.businessType ||
          !form.gstNumber || !form.gstDocument ||
          !form.street || !form.city || !form.state || !form.pincode) {
        setError("All required fields must be filled."); return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match."); return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters."); return;
      }
      if (form.productCategories.length === 0) {
        setError("Select at least one product category."); return;
      }
      if (!form.agreedToTerms) {
        setError("You must agree to GreenWheels Vendor Terms."); return;
      }

      const res  = await fetch("/api/auth/vendor-register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         form.name,
          email:        form.email,
          password:     form.password,
          phone:        form.phone,
          businessName: form.businessName,
          businessType: form.businessType,
          gstNumber:    form.gstNumber,
          gstDocument:  form.gstDocument,
          tradeLicense:    form.tradeLicense,
          tradeLicenseDoc: form.tradeLicenseDoc,
          araiApproval:    form.araiApproval,
          araiApprovalDoc: form.araiApprovalDoc,
          productCategories: form.productCategories,
          bankAccountName:   form.bankAccountName,
          bankAccountNumber: form.bankAccountNumber,
          bankIfsc:          form.bankIfsc,
          address: {
            street:  form.street,
            city:    form.city,
            state:   form.state,
            pincode: form.pincode,
          },
          agreedToTerms: form.agreedToTerms,
        }),
      });

      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setStep("otp");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp(otpValue?: string) {
    const finalOtp = otpValue ?? otp;
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action: "verify",
          otp:    finalOtp,
          role:   "vendor",
          email:  form.email,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      router.push("/login?registered=vendor");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br
                          from-gw-400 to-lime-400 flex items-center
                          justify-center text-2xl mx-auto mb-3">
            🏭
          </div>
          <h1 className="font-black text-2xl text-white">
            Become a GreenWheels Vendor
          </h1>
          <p className="text-gw-400 text-sm mt-1">
            {step === "form"
              ? "Sell your EV products to thousands of customers and dealers"
              : "Verify your email to complete registration"}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl
                            px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === "form" ? (
            <div className="flex flex-col gap-4">

              {/* Personal Info */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2">
                👤 Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}/>
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input" type="tel" placeholder="10-digit"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g,"").slice(0,10)
                    })}/>
                </div>
              </div>

              <div>
                <label className="label">Email *</label>
                <input className="input" type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password *</label>
                  <input className="input" type="password"
                    placeholder="Min 8 chars"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}/>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input className="input" type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    style={{
                      border: form.confirmPassword
                        ? form.confirmPassword === form.password
                          ? "2px solid #a3e635"
                          : "2px solid #ef4444"
                        : undefined
                    }}
                    onChange={e => setForm({
                      ...form, confirmPassword: e.target.value
                    })}/>
                  {form.confirmPassword && (
                    <p className={`text-xs mt-1 ${
                      form.confirmPassword === form.password
                        ? "text-lime-400" : "text-red-400"
                    }`}>
                      {form.confirmPassword === form.password
                        ? "✓ Passwords match"
                        : "✗ Do not match"}
                    </p>
                  )}
                </div>
              </div>

              {/* Business Info */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                🏭 Business Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Business Name *</label>
                  <input className="input" placeholder="e.g. Bosch India Pvt Ltd"
                    value={form.businessName}
                    onChange={e => setForm({...form, businessName: e.target.value})}/>
                </div>
                <div>
                  <label className="label">Business Type *</label>
                  <select className="input"
                    value={form.businessType}
                    onChange={e => setForm({...form, businessType: e.target.value})}>
                    <option value="">Select type</option>
                    <option value="individual">Individual Seller</option>
                    <option value="company">Company / Pvt Ltd</option>
                    <option value="brand">Brand / Manufacturer</option>
                  </select>
                </div>
              </div>

              {/* GST */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">GST Number *</label>
                  <input className="input" placeholder="15-digit GSTIN"
                    maxLength={15}
                    value={form.gstNumber}
                    onChange={e => setForm({
                      ...form,
                      gstNumber: e.target.value.toUpperCase()
                    })}/>
                </div>
                <div>
                  <label className="label">Upload GST Certificate *</label>
                  {form.gstDocument ? (
                    <div style={{ border: "1px solid #a3e635" }}
                      className="rounded-xl p-2 flex items-center
                                 justify-between">
                      <span className="text-lime-400 text-xs">
                        ✓ Uploaded
                      </span>
                      <button onClick={() => setForm(p=>({...p,gstDocument:""}))}
                        className="text-red-400 text-xs">Remove</button>
                    </div>
                  ) : (
                    <label style={{ border: "2px dashed #14532d" }}
                      className={`flex items-center justify-center h-10
                        rounded-xl cursor-pointer bg-gw-900/50 text-xs
                        text-gw-500 transition-all
                        ${uploadingGst?"opacity-60":""}`}>
                      {uploadingGst ? "Uploading..." : "📄 Upload PDF/Image"}
                      <input type="file" accept="image/*,.pdf"
                        className="hidden" disabled={uploadingGst}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f,"gstDocument",setUploadingGst);
                        }}/>
                    </label>
                  )}
                </div>
              </div>

              {/* Trade License */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Trade License No. (Optional)</label>
                  <input className="input" placeholder="Trade license number"
                    value={form.tradeLicense}
                    onChange={e => setForm({...form, tradeLicense: e.target.value})}/>
                </div>
                <div>
                  <label className="label">Upload Trade License (Optional)</label>
                  {form.tradeLicenseDoc ? (
                    <div style={{ border: "1px solid #a3e635" }}
                      className="rounded-xl p-2 flex items-center justify-between">
                      <span className="text-lime-400 text-xs">✓ Uploaded</span>
                      <button onClick={() => setForm(p=>({...p,tradeLicenseDoc:""}))}
                        className="text-red-400 text-xs">Remove</button>
                    </div>
                  ) : (
                    <label style={{ border: "2px dashed #14532d" }}
                      className={`flex items-center justify-center h-10
                        rounded-xl cursor-pointer bg-gw-900/50 text-xs
                        text-gw-500 ${uploadingTrade?"opacity-60":""}`}>
                      {uploadingTrade ? "Uploading..." : "📄 Upload"}
                      <input type="file" accept="image/*,.pdf"
                        className="hidden" disabled={uploadingTrade}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f,"tradeLicenseDoc",setUploadingTrade);
                        }}/>
                    </label>
                  )}
                </div>
              </div>

              {/* ARAI Approval */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/20 rounded-xl p-4">
                <p className="text-white font-bold text-sm mb-1">
                  ⚡ ARAI/BIS/ICAT Approval (Required for Kit/Battery sellers)
                </p>
                <p className="text-gw-500 text-xs mb-3">
                  If you sell EV conversion kits or batteries, you must
                  provide ARAI/ICAT type approval. Other sellers can skip.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Approval Certificate No.</label>
                    <input className="input"
                      placeholder="e.g. ARAI/EV/2024/001"
                      value={form.araiApproval}
                      onChange={e => setForm({
                        ...form, araiApproval: e.target.value
                      })}/>
                  </div>
                  <div>
                    <label className="label">Upload Certificate</label>
                    {form.araiApprovalDoc ? (
                      <div style={{ border: "1px solid #a3e635" }}
                        className="rounded-xl p-2 flex items-center justify-between">
                        <span className="text-lime-400 text-xs">✓ Uploaded</span>
                        <button onClick={() => setForm(p=>({...p,araiApprovalDoc:""}))}
                          className="text-red-400 text-xs">Remove</button>
                      </div>
                    ) : (
                      <label style={{ border: "2px dashed #14532d" }}
                        className={`flex items-center justify-center h-10
                          rounded-xl cursor-pointer bg-gw-900/50 text-xs
                          text-gw-500 ${uploadingArai?"opacity-60":""}`}>
                        {uploadingArai ? "Uploading..." : "📄 Upload"}
                        <input type="file" accept="image/*,.pdf"
                          className="hidden" disabled={uploadingArai}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(f,"araiApprovalDoc",setUploadingArai);
                          }}/>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <label className="label">Product Categories You Sell *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <button key={cat} type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        border: `1px solid ${form.productCategories.includes(cat)
                          ? "#a3e635" : "#14532d"}`,
                        background: form.productCategories.includes(cat)
                          ? "#a3e63510" : "transparent",
                      }}
                      className="flex items-center gap-2 px-3 py-2
                                 rounded-xl text-left transition-all">
                      <span style={{
                        width:"14px",height:"14px",borderRadius:"4px",flexShrink:0,
                        border:`2px solid ${form.productCategories.includes(cat)
                          ?"#a3e635":"#14532d"}`,
                        background:form.productCategories.includes(cat)
                          ?"#a3e63520":"transparent",
                        display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:"10px",color:"#a3e635",
                      }}>
                        {form.productCategories.includes(cat) && "✓"}
                      </span>
                      <span className={`text-xs font-medium ${
                        form.productCategories.includes(cat)
                          ? "text-lime-400" : "text-gw-300"
                      }`}>
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Details */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                🏦 Bank Details (for payouts)
              </h3>

              <div>
                <label className="label">Account Holder Name</label>
                <input className="input" placeholder="Name on bank account"
                  value={form.bankAccountName}
                  onChange={e => setForm({...form, bankAccountName: e.target.value})}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Account Number</label>
                  <input className="input" placeholder="Bank account number"
                    value={form.bankAccountNumber}
                    onChange={e => setForm({
                      ...form, bankAccountNumber: e.target.value
                    })}/>
                </div>
                <div>
                  <label className="label">IFSC Code</label>
                  <input className="input" placeholder="e.g. HDFC0001234"
                    value={form.bankIfsc}
                    onChange={e => setForm({
                      ...form,
                      bankIfsc: e.target.value.toUpperCase()
                    })}/>
                </div>
              </div>

              {/* Address */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                📍 Business Address
              </h3>

              <div>
                <label className="label">Street Address *</label>
                <input className="input" placeholder="Street / Area"
                  value={form.street}
                  onChange={e => setForm({...form, street: e.target.value})}/>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">City *</label>
                  <input className="input" placeholder="City"
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})}/>
                </div>
                <div>
                  <label className="label">State *</label>
                  <select className="input"
                    value={form.state}
                    onChange={e => setForm({...form, state: e.target.value})}>
                    <option value="">Select</option>
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Pincode *</label>
                  <input className="input" placeholder="6-digit"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => setForm({
                      ...form,
                      pincode: e.target.value.replace(/\D/g,"").slice(0,6)
                    })}/>
                </div>
              </div>

              {/* Terms */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-4">
                <div className="flex items-start gap-3">
                  <button type="button"
                    onClick={() => setForm(p => ({
                      ...p, agreedToTerms: !p.agreedToTerms
                    }))}
                    style={{
                      width:"22px",height:"22px",borderRadius:"6px",flexShrink:0,
                      border:form.agreedToTerms?"2px solid #a3e635":"2px solid #14532d",
                      background:form.agreedToTerms?"#a3e63520":"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer",marginTop:"1px",
                    }}>
                    {form.agreedToTerms && (
                      <span style={{color:"#a3e635",fontSize:"13px",fontWeight:900}}>
                        ✓
                      </span>
                    )}
                  </button>
                  <p className="text-gw-400 text-xs leading-relaxed">
                    <span className="text-white font-bold">I agree: *{" "}</span>
                    I confirm all submitted documents are genuine.
                    I will only sell legally compliant, certified products.
                    I understand that GreenWheels takes 10% commission on
                    all sales. Selling fake or uncertified products will
                    result in immediate account suspension and legal action.
                  </p>
                </div>
              </div>

              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3">
                <p className="text-gw-400 text-xs leading-relaxed">
                  <span className="text-white font-semibold">ℹ️ Note: </span>
                  After registration your profile will be reviewed by our
                  support team and approved by admin. You can list products
                  after approval.
                </p>
              </div>

              <button className="btn-primary w-full mt-2"
                onClick={handleRegister} disabled={loading}>
                {loading
                  ? <><span>Registering</span> <LoadingDots /></>
                  : "Register & Send OTP →"
                }
              </button>

              <p className="text-center text-gw-500 text-xs">
                Already registered?{" "}
                <Link href="/login"
                  className="text-lime-400 hover:text-white">
                  Login here
                </Link>
              </p>

            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-gw-400 text-sm text-center">
                OTP sent to{" "}
                <strong className="text-white">{form.email}</strong>
              </p>
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input
                  className="input text-center text-2xl
                             tracking-widest font-mono"
                  placeholder="000000" maxLength={6}
                  value={otp}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g,"");
                    setOtp(val);
                    if (val.length === 6) handleVerifyOtp(val);
                  }}/>
              </div>
              <button className="btn-primary w-full"
                onClick={() => handleVerifyOtp()} disabled={loading}>
                {loading
                  ? <><span>Verifying</span> <LoadingDots /></>
                  : "Verify & Complete →"
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}