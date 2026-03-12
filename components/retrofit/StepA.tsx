import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
};

const VEHICLES = [
  { type: "car",  icon: "🚗", label: "Car",           desc: "Hatchback, Sedan, SUV" },
  { type: "bike", icon: "🏍️", label: "Bike / Scooter", desc: "Motorcycle, Scooter" },
  { type: "auto", icon: "🛺", label: "Auto-Rickshaw",  desc: "3-Wheeler" },
];

export default function StepA({ form, updateForm, nextStep }: Props) {
  function handleSelect(type: "car" | "bike" | "auto") {
    updateForm({ vehicleType: type });
  }

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        What type of vehicle do you want to retrofit?
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Select your vehicle type to get started.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        {VEHICLES.map((v) => (
          <button
            key={v.type}
            onClick={() => handleSelect(v.type as "car" | "bike" | "auto")}
            style={{
              border: `2px solid ${
                form.vehicleType === v.type ? "#a3e635" : "#14532d"
              }`,
            }}
            className={`w-full rounded-2xl p-5 flex items-center gap-4
              text-left transition-all duration-200
              ${form.vehicleType === v.type
                ? "bg-lime-400/10"
                : "bg-gw-900/50 hover:border-gw-600"
              }`}>
            <span className="text-4xl">{v.icon}</span>
            <div>
              <div className="font-black text-white text-lg">{v.label}</div>
              <div className="text-gw-400 text-sm">{v.desc}</div>
            </div>
            {form.vehicleType === v.type && (
              <span className="ml-auto text-lime-400 text-xl">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        className="btn-primary w-full"
        onClick={nextStep}
        disabled={!form.vehicleType}>
        Continue →
      </button>
    </div>
  );
}