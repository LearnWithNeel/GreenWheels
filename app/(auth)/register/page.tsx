"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [email, setEmail]     = useState("");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [otp, setOtp]         = useState("");

  async function handleRegister() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setEmail(form.email);
      setStep("otp");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleVerifyOTP() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      router.push("/login?verified=true");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gw-400 to-lime-400 flex items-center justify-center text-lg">🌿</div>
            <span className="font-black text-xl text-white">GreenWheels</span>
          </Link>
          <h1 className="font-black text-2xl text-white">
            {step === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-gw-400 text-sm mt-1">
            {step === "form" ? "Join GreenWheels — it's free" : `OTP sent to ${email}`}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === "form" ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn-primary w-full mt-2" onClick={handleRegister} disabled={loading}>
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input className="input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
              </div>
              <button className="btn-primary w-full" onClick={handleVerifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
              <button className="text-gw-400 text-sm hover:text-white transition-colors"
                onClick={() => handleRegister()}>
                Resend OTP
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gw-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-lime-400 font-semibold hover:text-white">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}