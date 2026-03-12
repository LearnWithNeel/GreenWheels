import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
  prevStep:   () => void;
};

const RETROFIT_TYPES = [
  {
    type:  "pure_electric",
    icon:  "⚡",
    label: "Pure Electric",
    desc:  "Complete removal of combustion engine. 100% electric motor and battery. Zero emissions, zero fuel cost. Best for city driving.",
    pros:  ["Zero fuel cost", "Zero emissions", "Low maintenance", "Silent operation"],
  },
  {
    type:  "hybrid",
    icon:  "🔋",
    label: "Hybrid",
    desc:  "Keep existing engine + add electric motor. Switch between fuel and electric. Best for long distance + city combo.",
    pros:  ["Long range", "No range anxiety", "Fuel backup", "Better highway performance"],
  },
];

export default function StepE({ form, updateForm, nextStep, prevStep }: Props) {
  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Choose your retrofit type
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Select the type of EV conversion you want for your vehicle.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        {RETROFIT_TYPES.map((r) => (
          <button
            key={r.type}
            onClick={() => updateForm({
              retrofitType: r.type as "pure_electric" | "hybrid"
            })}
            style={{
              border: `2px solid ${
                form.retrofitType === r.type ? "#a3e635" : "#14532d"
              }`,
            }}
            className={`w-full rounded-2xl p-5 text-left transition-all
              ${form.retrofitType === r.type
                ? "bg-lime-400/10"
                : "bg-gw-900/50 hover:border-gw-600"
              }`}>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{r.icon}</span>
                <span className="font-black text-white text-lg">{r.label}</span>
              </div>
              {form.retrofitType === r.type && (
                <span className="text-lime-400 text-xl">✓</span>
              )}
            </div>

            <p className="text-gw-400 text-sm mb-3 leading-relaxed">{r.desc}</p>

            <div className="flex flex-wrap gap-2">
              {r.pros.map(pro => (
                <span key={pro}
                  style={{ border: "1px solid #14532d" }}
                  className="text-xs text-gw-300 px-2 py-1 rounded-lg bg-gw-900">
                  ✓ {pro}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={nextStep}
          disabled={!form.retrofitType}>
          Continue →
        </button>
      </div>
    </div>
  );
}