"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StepA from "@/components/retrofit/StepA";
import StepB from "@/components/retrofit/StepB";
import StepC from "@/components/retrofit/StepC";
import StepD from "@/components/retrofit/StepD";
import StepE from "@/components/retrofit/StepE";
import StepF from "@/components/retrofit/StepF";
import StepG from "@/components/retrofit/StepG";
import StepH from "@/components/retrofit/StepH";

export type RetrofitFormData = {
  vehicleType: "car" | "bike" | "auto" | "";
  brand:        string;
  model:        string;
  year:         string;
  registrationNumber: string;
  color:        string;
  fuelType:     string;
  kmDriven:     string;
  photoFront:   string;
  photoBack:    string;
  photoLeft:    string;
  photoRight:   string;
  rcDocument:   string;
  ownerName:    string;
  ownerAddress: string;
  retrofitType: "pure_electric" | "hybrid" | "";
  motorPower:   string;
  batteryCapacity: string;
  expectedRange:   string;
  chargingType:    string;
  specialRequests: string;
};

const INITIAL: RetrofitFormData = {
  vehicleType: "", brand: "", model: "", year: "",
  registrationNumber: "", color: "", fuelType: "", kmDriven: "",
  photoFront: "", photoBack: "", photoLeft: "", photoRight: "",
  rcDocument: "", ownerName: "", ownerAddress: "",
  retrofitType: "", motorPower: "", batteryCapacity: "",
  expectedRange: "", chargingType: "", specialRequests: "",
};

const STEPS = [
  { id: "A", label: "Vehicle Type" },
  { id: "B", label: "Details" },
  { id: "C", label: "Photos" },
  { id: "D", label: "Ownership" },
  { id: "E", label: "Retrofit" },
  { id: "F", label: "Motor" },
  { id: "G", label: "Battery" },
  { id: "H", label: "Review" },
];

const STORAGE_KEY = "gw-retrofit-form";
const STEP_KEY    = "gw-retrofit-step";

export default function RetrofitPage() {
  const { data: session }  = useSession();
  const router             = useRouter();
  const [step, setStep]    = useState(0);
  const [form, setForm]    = useState<RetrofitFormData>(INITIAL);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [restored, setRestored]           = useState(false);

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_KEY);
      if (savedForm) {
        setForm(JSON.parse(savedForm));
        setRestored(true);
      }
      if (savedStep) {
        setStep(parseInt(savedStep));
      }
    } catch {}
  }, []);

  // ── Auto save to localStorage on every change ──
  useEffect(() => {
    if (form === INITIAL) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      localStorage.setItem(STEP_KEY, step.toString());
    } catch {}
  }, [form, step]);

  function updateForm(data: Partial<RetrofitFormData>) {
    setForm(prev => ({ ...prev, ...data }));
  }

  function nextStep() { setStep(s => Math.min(s + 1, 7)); }
  function prevStep() { setStep(s => Math.max(s - 1, 0)); }

  async function handleSubmit() {
    // Not logged in — show popup, data is safe in localStorage
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }

    setSubmitting(true); setError("");
    try {
      const res  = await fetch("/api/retrofit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }

      // ── Clear saved form after successful submit ──
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);

      router.push(`/orders/${data.orderId}`);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  const stepProps = { form, updateForm, nextStep, prevStep };

  return (
    <main className="page-wrapper">
      <section className="section max-w-2xl mx-auto">

        {/* Restored Banner */}
        {restored && (
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/50 rounded-xl px-4 py-3 mb-6
                       flex items-center justify-between">
            <p className="text-gw-300 text-sm">
              ✅ Your previous form data has been restored.
            </p>
            <button
              onClick={() => {
                setForm(INITIAL);
                setStep(0);
                setRestored(false);
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(STEP_KEY);
              }}
              className="text-red-400 text-xs hover:text-red-300">
              Start Fresh
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="badge-green inline-block mb-3">
            Retrofit Inquiry
          </div>
          <h1 className="font-black text-3xl text-white">
            Start Your EV Conversion
          </h1>
          <p className="text-gw-400 text-sm mt-2">
            Step {step + 1} of 8 — {STEPS[step].label}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id}
              className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1.5 rounded-full transition-all
                ${i <= step ? "bg-lime-400" : "bg-gw-800"}`} />
              <span className={`text-xs font-bold hidden md:block
                ${i === step
                  ? "text-lime-400"
                  : i < step
                  ? "text-gw-500"
                  : "text-gw-700"}`}>
                {s.id}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50
                          text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Steps */}
        <div className="card">
          {step === 0 && <StepA {...stepProps} />}
          {step === 1 && <StepB {...stepProps} />}
          {step === 2 && <StepC {...stepProps} />}
          {step === 3 && <StepD {...stepProps} />}
          {step === 4 && <StepE {...stepProps} />}
          {step === 5 && <StepF {...stepProps} />}
          {step === 6 && <StepG {...stepProps} />}
          {step === 7 && (
            <StepH
              {...stepProps}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>

        {/* Login Prompt Popup */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-50 flex items-center
                          justify-center bg-black/70 px-4">
            <div style={{ border: "1px solid #14532d" }}
              className="bg-gw-950 rounded-2xl p-8 max-w-sm
                         w-full text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="font-black text-xl text-white mb-2">
                Almost there!
              </h2>
              <p className="text-gw-400 text-sm mb-2">
                Your form is <strong className="text-white">
                completely saved</strong> — you won't lose anything.
              </p>
              <p className="text-gw-400 text-sm mb-6">
                Login or create an account to submit your
                retrofit inquiry. We'll bring you right back here.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    router.push("/login?redirect=/retrofit");
                  }}>
                  Login to My Account
                </button>
                <button
                  className="btn-secondary w-full"
                  onClick={() => {
                    router.push("/register?redirect=/retrofit");
                  }}>
                  Create New Account
                </button>
                <button
                  className="text-gw-500 text-sm hover:text-white
                             transition-colors"
                  onClick={() => setShowLoginPrompt(false)}>
                  Cancel — Continue Filling Form
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}