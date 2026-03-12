"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ email: "", password: "" });
  const [otp, setOtp]         = useState("");

  async function handleAdminLogin() {
    setLoading(true); setError("");
    try {
      // Step 1 — validate fields
      if (!form.email || !form.password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }

      // Step 2 — check credentials against .env
      const checkRes  = await fetch("/api/auth/check-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    form.email,
          password: form.password,
          isAdmin:  true,
        }),
      });
      const checkData = await checkRes.json();
      if (!checkData.success) { setError(checkData.message); return; }

      // Step 3 — credentials correct, send OTP
      const res  = await fetch("/api/auth/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", role: "admin" }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setStep("otp");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleVerifyAndLogin() {
    setLoading(true); setError("");
    try {
      // Step 1 — verify OTP
      const otpRes  = await fetch("/api/auth/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", otp, role: "admin" }),
      });
      const otpData = await otpRes.json();
      if (!otpData.success) { setError(otpData.message); return; }

      // Step 2 — sign in with NextAuth
      const result = await signIn("admin-login", {
        email:    form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) { setError("Invalid admin credentials."); return; }
      router.push("/admin/dashboard");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400
                          flex items-center justify-center text-2xl mx-auto mb-3">
            🛡️
          </div>
          <h1 className="font-black text-2xl text-white">Admin Login</h1>
          <p className="text-gw-400 text-sm mt-1">
            {step === "form" ? "GreenWheels Admin Panel" : "OTP sent to admin email"}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400
                            text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === "form" ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Admin Email</label>
                <input className="input" type="email"
                  placeholder="Enter admin email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password"
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn-primary w-full mt-2"
                onClick={handleAdminLogin} disabled={loading}>
                {loading ? "Checking..." : "Send OTP →"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input className="input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000" maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
              </div>
              <button className="btn-primary w-full"
                onClick={handleVerifyAndLogin} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enter →"}
              </button>
              <button className="text-gw-400 text-sm hover:text-white transition-colors"
                onClick={() => handleAdminLogin()}>
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}