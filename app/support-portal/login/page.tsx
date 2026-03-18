"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDots from "@/components/LoadingDots";

export default function SupportLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin() {
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/support/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }

      // Redirect based on role
      if (data.user.role === "support_leader") {
        router.push("/support-portal/leader");
      } else {
        router.push("/support-portal/dashboard");
      }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-gw-950 flex items-center
                     justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #14532d, #a3e635)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "28px",
            margin: "0 auto 16px",
          }}>
            🛡️
          </div>
          <h1 className="font-black text-2xl text-white mb-1">
            GreenWheels Support Portal
          </h1>
          <p className="text-gw-500 text-sm">
            Restricted access — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/50 rounded-2xl p-6">

          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl
                            px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email"
                placeholder="your@greenwheels.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              className="btn-primary w-full mt-2"
              onClick={handleLogin}
              disabled={loading}>
              {loading
                ? <><span>Signing in</span> <LoadingDots /></>
                : "Sign In →"
              }
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #14532d" }}
          className="mt-6 pt-4 text-center">
          <p className="text-gw-700 text-xs">
            🔒 This portal is for GreenWheels support staff only.
            Unauthorized access is prohibited.
          </p>
          <p className="text-gw-800 text-xs mt-1">
            Forgot your credentials? Contact your team leader or admin.
          </p>
        </div>

      </div>
    </main>
  );
}