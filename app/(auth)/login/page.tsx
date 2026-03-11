"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"form" | "otp">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ email: "", password: "" });
    const [otp, setOtp] = useState("");

    async function handleLogin() {
        setLoading(true); setError("");
        try {
            // Step 1 — check password first
            const checkRes = await fetch("/api/auth/check-password", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const checkData = await checkRes.json();
            if (!checkData.success) { setError(checkData.message); return; }

            // Step 2 — password correct, now send OTP
            const otpRes = await fetch("/api/auth/otp", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send", email: form.email }),
            });
            const otpData = await otpRes.json();
            if (!otpData.success) { setError(otpData.message); return; }
            setStep("otp");
        } catch { setError("Something went wrong."); }
        finally { setLoading(false); }
    }

    async function handleVerifyAndLogin() {
        setLoading(true); setError("");
        try {
            // Verify OTP first
            const otpRes = await fetch("/api/auth/otp", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify", email: form.email, otp }),
            });
            const otpData = await otpRes.json();
            if (!otpData.success) { setError(otpData.message); return; }

            // Then sign in with NextAuth
            const result = await signIn("customer-login", {
                email: form.email, password: form.password, redirect: false,
            });

            if (result?.error) { setError("Invalid email or password."); return; }
            router.push("/dashboard");
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
                        {step === "form" ? "Welcome back" : "Verify your email"}
                    </h1>
                    <p className="text-gw-400 text-sm mt-1">
                        {step === "form" ? "Login to your GreenWheels account" : `OTP sent to ${form.email}`}
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
                                <label className="label">Email Address</label>
                                <input className="input" type="email" placeholder="you@email.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <input className="input" type="password" placeholder="Your password"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <button className="btn-primary w-full mt-2" onClick={handleLogin} disabled={loading}>
                                {loading ? "Sending OTP..." : "Continue →"}
                            </button>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gw-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs text-gw-600 bg-gw-900 px-2 w-fit mx-auto">
                                    or
                                </div>
                            </div>
                            <button className="btn-secondary w-full flex items-center justify-center gap-2"
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                                <span>🔵</span> Continue with Google
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
                            <button className="btn-primary w-full" onClick={handleVerifyAndLogin} disabled={loading}>
                                {loading ? "Verifying..." : "Verify & Login →"}
                            </button>
                            <button className="text-gw-400 text-sm hover:text-white transition-colors"
                                onClick={() => handleLogin()}>
                                Resend OTP
                            </button>
                        </div>
                    )}

                    <p className="text-center text-sm text-gw-400 mt-6">
                        No account yet?{" "}
                        <Link href="/register" className="text-lime-400 font-semibold hover:text-white">Register</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}