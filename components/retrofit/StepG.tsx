import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
  prevStep:   () => void;
};

const BATTERIES: Record<string, {
  capacity: string;
  range:    string;
  charge:   string;
  best:     string;
  price:    string;
}[]> = {
  car: [
    { capacity: "10kWh", range: "80–100 km",  charge: "4–5 hrs", best: "City commute only",        price: "Budget" },
    { capacity: "20kWh", range: "150–180 km", charge: "6–7 hrs", best: "City + short highway",     price: "Mid range" },
    { capacity: "30kWh", range: "220–260 km", charge: "8–9 hrs", best: "City + long highway",      price: "Premium" },
    { capacity: "40kWh", range: "300–350 km", charge: "10 hrs",  best: "Long distance travel",     price: "High end" },
  ],
  bike: [
    { capacity: "1.5kWh", range: "60–80 km",  charge: "3–4 hrs", best: "Daily short commute",      price: "Budget" },
    { capacity: "2.5kWh", range: "100–120 km", charge: "4–5 hrs", best: "Daily medium commute",    price: "Mid range" },
    { capacity: "4kWh",   range: "150–180 km", charge: "5–6 hrs", best: "Long daily commute",      price: "Premium" },
  ],
  auto: [
    { capacity: "5kWh",  range: "80–100 km",  charge: "4–5 hrs", best: "Short route auto",         price: "Budget" },
    { capacity: "7.5kWh", range: "120–150 km", charge: "5–6 hrs", best: "Standard commercial auto", price: "Mid range" },
    { capacity: "10kWh", range: "160–200 km", charge: "7–8 hrs", best: "Long route commercial",    price: "Premium" },
  ],
};

const CHARGING_TYPES = [
  { type: "standard", icon: "🔌", label: "Standard Charging",
    desc: "Charge from any 5A home socket. Slowest but most convenient." },
  { type: "fast",     icon: "⚡", label: "Fast Charging",
    desc: "Dedicated fast charger — 2x faster. Needs separate installation." },
  { type: "both",     icon: "🔋", label: "Both Options",
    desc: "Support both standard and fast charging. Most flexible option." },
];

export default function StepG({ form, updateForm, nextStep, prevStep }: Props) {
  const batteries = BATTERIES[form.vehicleType] ?? BATTERIES["car"];

  const valid = form.batteryCapacity && form.chargingType;

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Battery & Charging
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Choose your battery capacity based on your daily travel distance.
      </p>

      {/* Battery Selection */}
      <div className="mb-6">
        <label className="label mb-3 block">Battery Capacity</label>
        <div className="flex flex-col gap-3">
          {batteries.map((b) => (
            <button
              key={b.capacity}
              onClick={() => updateForm({
                batteryCapacity: b.capacity,
                expectedRange:   b.range,
              })}
              style={{
                border: `2px solid ${
                  form.batteryCapacity === b.capacity ? "#a3e635" : "#14532d"
                }`,
              }}
              className={`w-full rounded-2xl p-4 text-left transition-all
                ${form.batteryCapacity === b.capacity
                  ? "bg-lime-400/10"
                  : "bg-gw-900/50 hover:border-gw-600"
                }`}>

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lime-400">
                    {b.capacity}
                  </span>
                  <span style={{ border: "1px solid #14532d" }}
                    className="text-xs text-gw-400 px-2 py-0.5 rounded-lg">
                    {b.price}
                  </span>
                </div>
                {form.batteryCapacity === b.capacity && (
                  <span className="text-lime-400 text-xl">✓</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gw-400">
                <span>🛣️ Range: {b.range}</span>
                <span>⏱️ Charge time: {b.charge}</span>
                <span>✅ {b.best}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charging Type */}
      <div className="mb-8">
        <label className="label mb-3 block">Charging Type Preference</label>
        <div className="flex flex-col gap-3">
          {CHARGING_TYPES.map((c) => (
            <button
              key={c.type}
              onClick={() => updateForm({ chargingType: c.type })}
              style={{
                border: `2px solid ${
                  form.chargingType === c.type ? "#a3e635" : "#14532d"
                }`,
              }}
              className={`w-full rounded-2xl p-4 text-left transition-all
                flex items-center gap-4
                ${form.chargingType === c.type
                  ? "bg-lime-400/10"
                  : "bg-gw-900/50 hover:border-gw-600"
                }`}>
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{c.label}</div>
                <div className="text-gw-400 text-xs">{c.desc}</div>
              </div>
              {form.chargingType === c.type && (
                <span className="text-lime-400 text-xl shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={nextStep}
          disabled={!valid}>
          Continue →
        </button>
      </div>
    </div>
  );
}