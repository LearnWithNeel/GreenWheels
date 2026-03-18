"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingDots from "@/components/LoadingDots";

const STORAGE_KEY = "gw-dealer-register-form";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const ARAI_KIT_BRANDS = [
  "Bosch eAxle",
  "Loop Moto",
  "E-Trio",
  "Bharat Kits",
  "EV Motoo",
  "Lectrix",
  "GoEgo",
  "Other (Submit for Review)",
];

const GOVT_ID_TYPES = [
  "GST Certificate",
  "Trade License",
  "Shop & Establishment License",
  "MSME Certificate",
  "ARAI Certification",
  "Other",
];

export default function DealerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");


  // Upload states
  const [uploadingLicDoc, setUploadingLicDoc] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const [form, setForm] = useState({
    // Auth
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    // Business
    garageName: "",
    govtLicenseNo: "",
    govtIdType: "",
    govtLicenseDoc: "",  // uploaded URL
    profileImage: "",  // uploaded URL

    // Address
    street: "",
    city: "",
    state: "",
    pincode: "",

    // Skills
    specialization: [] as string[],
    experience: "",

    // Extra
    certifications: [] as string[],
    araiKitBrands: [] as string[],
    erfcCertified: false,
    erfcCertNo: "",
  });

  const [restored, setRestored] = useState(false);

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({
          ...prev,
          ...parsed,
          araiKitBrands: parsed.araiKitBrands ?? [],
          erfcCertified: parsed.erfcCertified ?? false,
          erfcCertNo: parsed.erfcCertNo ?? "",
        }));
      }
    } catch { }
    setRestored(true);
  }, []);

  // ── Auto save ONLY after restore is done ──
  useEffect(() => {
    if (!restored) return;
    try {
      const { password, confirmPassword, ...safeForm } = form;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeForm));
    } catch { }
  }, [form, restored]);

  function toggleSpec(type: string) {
    setForm(prev => ({
      ...prev,
      specialization: prev.specialization.includes(type)
        ? prev.specialization.filter(s => s !== type)
        : [...prev.specialization, type],
    }));
  }

  async function handleUpload(
    file: File,
    field: "govtLicenseDoc" | "profileImage",
    setStat: (v: boolean) => void
  ) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB."); return;
    }
    setStat(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", field);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) { setError(json.message); return; }
      setForm(prev => ({ ...prev, [field]: json.url }));
    } catch { setError("Upload failed. Try again."); }
    finally { setStat(false); }
  }

  async function handleRegister() {
    setError(""); setLoading(true);
    try {
      // Validate required fields
      if (!form.name || !form.email || !form.password ||
        !form.phone || !form.garageName || !form.govtLicenseNo ||
        !form.govtIdType || !form.street || !form.city ||
        !form.state || !form.pincode) {
        setError("All fields marked are required."); return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match."); return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters."); return;
      }
      if (form.specialization.length === 0) {
        setError("Select at least one vehicle specialization."); return;
      }
      if (!form.govtLicenseDoc) {
        setError("Please upload your government license document."); return;
      }
      if (!form.erfcCertified) {
        setError("You must confirm ERFC certification to register as a dealer."); return;
      }
      if (form.araiKitBrands.length === 0) {
        setError("Select at least one ARAI approved kit brand you work with."); return;
      }

      const res = await fetch("/api/auth/dealer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          garageName: form.garageName,
          govtLicenseNo: form.govtLicenseNo,
          govtIdType: form.govtIdType,
          govtLicenseDoc: form.govtLicenseDoc,
          profileImage: form.profileImage,
          garageAddress: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          specialization: form.specialization,
          experience: parseInt(form.experience) || 0,
          certifications: form.certifications,
          araiKitBrands: form.araiKitBrands,
          erfcCertified: form.erfcCertified,
          erfcCertNo: form.erfcCertNo,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      localStorage.removeItem(STORAGE_KEY);
      setStep("otp");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp(otpValue?: string) {
    const finalOtp = otpValue ?? otp;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          otp: finalOtp,
          role: "dealer",
          email: form.email,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      router.push("/login?registered=dealer");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleResendOtp() {
    setLoading(true);
    try {
      await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          role: "dealer",
          email: form.email,
        }),
      });
    } catch { }
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br
                          from-gw-400 to-lime-400 flex items-center
                          justify-center text-2xl mx-auto mb-3">
            🔧
          </div>
          <h1 className="font-black text-2xl text-white">
            Become a GreenWheels Dealer
          </h1>
          <p className="text-gw-400 text-sm mt-1">
            {step === "form"
              ? "Register your workshop and start receiving orders"
              : "Verify your email to complete registration"}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === "form" ? (
            <div className="flex flex-col gap-4">

              {/* ── Personal Info ── */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2">
                👤 Personal Information
              </h3>

              {/* Profile Image Upload */}
              <div>
                <label className="label">Profile Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Profile"
                      className="w-16 h-16 rounded-full object-cover
                                 border-2 border-lime-400" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gw-800
                                    flex items-center justify-center
                                    text-2xl border-2 border-gw-700">
                      👤
                    </div>
                  )}
                  <label className={`btn-secondary text-xs py-2 px-4
                    cursor-pointer ${uploadingProfile ? "opacity-60" : ""}`}>
                    {uploadingProfile ? "Uploading..." : "Upload Photo"}
                    <input type="file" accept="image/*" className="hidden"
                      disabled={uploadingProfile}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f, "profileImage", setUploadingProfile);
                      }} />
                  </label>
                  {form.profileImage && (
                    <button onClick={() => setForm(p => ({
                      ...p, profileImage: ""
                    }))}
                      className="text-red-400 text-xs">Remove</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input className="input" type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                    })} />
                </div>
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input className="input" type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password *</label>
                  <input className="input" type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={e => setForm({
                      ...form, password: e.target.value
                    })} />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => setForm({
                      ...form, confirmPassword: e.target.value
                    })}
                    style={{
                      border: form.confirmPassword
                        ? form.confirmPassword === form.password
                          ? "2px solid #a3e635"
                          : "2px solid #ef4444"
                        : undefined
                    }}
                  />
                  {form.confirmPassword && (
                    <p className={`text-xs mt-1 font-medium ${form.confirmPassword === form.password
                      ? "text-lime-400"
                      : "text-red-400"
                      }`}>
                      {form.confirmPassword === form.password
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Workshop Info ── */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                🏪 Workshop Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Workshop / Garage Name *</label>
                  <input className="input" placeholder="e.g. Neel Auto Works"
                    value={form.garageName}
                    onChange={e => setForm({
                      ...form, garageName: e.target.value
                    })} />
                </div>
                <div>
                  <label className="label">Years of Experience *</label>
                  <input className="input" type="number"
                    placeholder="e.g. 5" min="0" max="50"
                    value={form.experience}
                    onChange={e => setForm({
                      ...form, experience: e.target.value
                    })} />
                </div>
              </div>

              {/* Govt ID Type + Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Government ID Type *</label>
                  <select className="input"
                    value={form.govtIdType}
                    onChange={e => setForm({
                      ...form, govtIdType: e.target.value
                    })}>
                    <option value="">Select ID Type</option>
                    {GOVT_ID_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">License / ID Number *</label>
                  <input className="input"
                    placeholder="ID number"
                    value={form.govtLicenseNo}
                    onChange={e => setForm({
                      ...form, govtLicenseNo: e.target.value
                    })} />
                </div>
              </div>

              {/* Govt License Doc Upload */}
              <div>
                <label className="label">
                  Upload Government License Document *
                </label>
                {form.govtLicenseDoc ? (
                  <div style={{ border: "2px solid #a3e635" }}
                    className="rounded-xl p-3 flex items-center
                               justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <div className="text-white text-xs font-semibold">
                          Document uploaded ✓
                        </div>
                        <a href={form.govtLicenseDoc} target="_blank"
                          className="text-lime-400 text-xs hover:underline">
                          View document
                        </a>
                      </div>
                    </div>
                    <button onClick={() => setForm(p => ({
                      ...p, govtLicenseDoc: ""
                    }))}
                      className="text-red-400 text-xs">Remove</button>
                  </div>
                ) : (
                  <label
                    style={{ border: "2px dashed #14532d" }}
                    className={`flex flex-col items-center justify-center
                      h-24 rounded-xl cursor-pointer hover:border-gw-500
                      bg-gw-900/50 transition-all
                      ${uploadingLicDoc ? "opacity-60 cursor-wait" : ""}`}>
                    {uploadingLicDoc ? (
                      <span className="text-gw-400 text-sm">Uploading...</span>
                    ) : (
                      <>
                        <span className="text-2xl mb-1">📄</span>
                        <span className="text-gw-400 text-xs">
                          Image or PDF — max 10MB
                        </span>
                      </>
                    )}
                    <input type="file" accept="image/*,.pdf"
                      className="hidden" disabled={uploadingLicDoc}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(
                          f, "govtLicenseDoc", setUploadingLicDoc
                        );
                      }} />
                  </label>
                )}
              </div>

              {/* ── Address ── */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                📍 Workshop Address
              </h3>

              <div>
                <label className="label">Street Address *</label>
                <input className="input"
                  placeholder="Street / Area / Locality"
                  value={form.street}
                  onChange={e => setForm({
                    ...form, street: e.target.value
                  })} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">City *</label>
                  <input className="input" placeholder="City"
                    value={form.city}
                    onChange={e => setForm({
                      ...form, city: e.target.value
                    })} />
                </div>
                <div>
                  <label className="label">State *</label>
                  <select className="input"
                    value={form.state}
                    onChange={e => setForm({
                      ...form, state: e.target.value
                    })}>
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
                      ...form, pincode: e.target.value
                    })} />
                </div>
              </div>

              {/* ── Specialization ── */}
              <h3 className="font-bold text-white text-sm border-b
                             border-gw-800 pb-2 mt-2">
                🔧 Vehicle Specialization *
              </h3>

              <div className="flex gap-3">
                {[
                  { type: "car", icon: "🚗", label: "Car" },
                  { type: "bike", icon: "🏍️", label: "Bike" },
                  { type: "auto-rickshaw", icon: "🛺", label: "Auto" },
                ].map(v => (
                  <button key={v.type} type="button"
                    onClick={() => toggleSpec(v.type)}
                    style={{
                      border: `2px solid ${form.specialization.includes(v.type)
                        ? "#a3e635" : "#14532d"
                        }`,
                    }}
                    className={`flex-1 rounded-xl py-3 flex flex-col
                      items-center gap-1 transition-all
                      ${form.specialization.includes(v.type)
                        ? "bg-lime-400/10" : "bg-gw-900/50"
                      }`}>
                    <span className="text-2xl">{v.icon}</span>
                    <span className="text-xs font-bold text-white">
                      {v.label}
                    </span>
                    {form.specialization.includes(v.type) && (
                      <span className="text-lime-400 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Certifications ── */}
              <div>
                <label className="label">
                  Certifications (Optional — press Enter to add)
                </label>
                {/* ── ERFC Certification ── */}
                <h3 className="font-bold text-white text-sm border-b
               border-gw-800 pb-2 mt-2">
                  🏭 ERFC & ARAI Compliance
                </h3>

                {/* ERFC Certified checkbox */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, erfcCertified: !p.erfcCertified }))}
                      style={{
                        width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                        border: form.erfcCertified ? "2px solid #a3e635" : "2px solid #14532d",
                        background: form.erfcCertified ? "#a3e63520" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", marginTop: "1px",
                      }}>
                      {form.erfcCertified && (
                        <span style={{ color: "#a3e635", fontSize: "13px", fontWeight: 900 }}>✓</span>
                      )}
                    </button>
                    <div>
                      <p className="text-white font-bold text-sm leading-none mb-1">
                        I confirm this is a certified ERFC Workshop *
                      </p>
                      <p className="text-gw-500 text-xs leading-relaxed">
                        Electric Retro-fitment Centre (ERFC) certified by MoRTH/State RTO.
                        Only ERFC workshops can legally perform EV retrofits in India.
                      </p>
                      <p className="text-gw-600 text-xs mt-1" style={{ borderTop: "1px solid #14532d" }}>
                        Not ERFC certified yet?{" "}
                        <a href="https://vahan.parivahan.gov.in" target="_blank"
                          className="text-lime-400 hover:text-white transition-colors">
                          Apply on VAHAN portal →
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* ERFC Certificate Number */}
                  {form.erfcCertified && (
                    <div>
                      <label className="label">ERFC Certificate Number (Optional)</label>
                      <input className="input"
                        placeholder="e.g. ERFC-MH-2024-00123"
                        value={form.erfcCertNo}
                        onChange={e => setForm({ ...form, erfcCertNo: e.target.value })} />
                    </div>
                  )}
                </div>

                {/* ARAI Kit Brands */}
                <div>
                  <label className="label">
                    ARAI/ICAT Approved Kit Brands You Use *
                  </label>
                  <p className="text-gw-600 text-xs mb-3">
                    Select all brands whose approved kits you work with.
                    Only approved kit brands are permitted on GreenWheels.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ARAI_KIT_BRANDS.map(brand => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setForm(p => ({
                          ...p,
                          araiKitBrands: p.araiKitBrands.includes(brand)
                            ? p.araiKitBrands.filter(b => b !== brand)
                            : [...p.araiKitBrands, brand],
                        }))}
                        style={{
                          border: `1px solid ${form.araiKitBrands.includes(brand)
                            ? "#a3e635" : "#14532d"}`,
                          background: form.araiKitBrands.includes(brand)
                            ? "#a3e63510" : "transparent",
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                   text-left transition-all">
                        <span style={{
                          width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                          border: form.araiKitBrands.includes(brand)
                            ? "2px solid #a3e635" : "2px solid #14532d",
                          background: form.araiKitBrands.includes(brand)
                            ? "#a3e63520" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", color: "#a3e635",
                        }}>
                          {form.araiKitBrands.includes(brand) && "✓"}
                        </span>
                        <span className={`text-xs font-medium ${form.araiKitBrands.includes(brand)
                          ? "text-lime-400" : "text-gw-300"
                          }`}>
                          {brand}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <input className="input"
                  placeholder="e.g. ARAI Certified, ISO 9001..."
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !form.certifications.includes(val)) {
                        setForm(p => ({
                          ...p,
                          certifications: [...p.certifications, val],
                        }));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }} />
                {form.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.certifications.map(c => (
                      <span key={c}
                        style={{ border: "1px solid #14532d" }}
                        className="text-xs text-gw-300 px-2 py-1
                                   rounded-lg bg-gw-900 flex items-center gap-1">
                        {c}
                        <button
                          onClick={() => setForm(p => ({
                            ...p,
                            certifications: p.certifications.filter(
                              x => x !== c
                            ),
                          }))}
                          className="text-red-400 hover:text-red-300 ml-1">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Note */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3">
                <p className="text-gw-400 text-xs leading-relaxed">
                  <span className="text-white font-semibold">ℹ️ Note: </span>
                  After registration your profile will be reviewed by our admin
                  team. You can login immediately but will only be visible to
                  customers after admin approves your profile.
                </p>
              </div>

              <button className="btn-primary w-full mt-2"
                onClick={handleRegister} disabled={loading}>
                {loading ? <><span>Registering</span> <LoadingDots /></> : "Register & Send OTP →"}
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
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                    if (val.length === 6) handleVerifyOtp(val);
                  }} />
              </div>
              <button className="btn-primary w-full"
                onClick={() => handleVerifyOtp()} disabled={loading}>
                {loading ? <><span>Verifying</span> <LoadingDots /></> : "Verify & Complete Registration →"}
              </button>
              <button
                className="text-gw-400 text-sm hover:text-white
                           transition-colors"
                onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}