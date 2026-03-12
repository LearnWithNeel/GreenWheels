import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
  prevStep:   () => void;
};

const MOTORS: Record<string, {
  power: string;
  label: string;
  desc:  string;
  best:  string;
  speed: string;
  price: string;
}[]> = {
  car: [
    { power: "10kW",  label: "10 kW Motor",  desc: "Entry level for small hatchbacks.",     best: "Alto, Nano, Reva",          speed: "60–80 km/h",  price: "Budget friendly" },
    { power: "20kW",  label: "20 kW Motor",  desc: "Mid range for standard hatchbacks.",    best: "WagonR, i10, Swift",        speed: "80–100 km/h", price: "Mid range" },
    { power: "30kW",  label: "30 kW Motor",  desc: "Performance for sedans and SUVs.",      best: "Dzire, Ertiga, Creta",      speed: "100–120 km/h", price: "Premium" },
    { power: "50kW",  label: "50 kW Motor",  desc: "High performance for large vehicles.",  best: "Innova, Fortuner, SUVs",    speed: "120+ km/h",  price: "High end" },
  ],
  bike: [
    { power: "1kW",   label: "1 kW Motor",   desc: "Light duty for small scooters.",        best: "Activa, Access, Dio",       speed: "45–55 km/h",  price: "Budget friendly" },
    { power: "2kW",   label: "2 kW Motor",   desc: "Standard for daily commute scooters.",  best: "Jupiter, Ntorq, Burgman",   speed: "55–70 km/h",  price: "Mid range" },
    { power: "5kW",   label: "5 kW Motor",   desc: "Performance for motorcycles.",          best: "Splendor, Pulsar, FZ",      speed: "80–100 km/h", price: "Premium" },
    { power: "10kW",  label: "10 kW Motor",  desc: "High performance motorcycles.",         best: "R15, Duke, Dominar",        speed: "100+ km/h",   price: "High end" },
  ],
  auto: [
    { power: "3kW",   label: "3 kW Motor",   desc: "Light duty auto-rickshaw.",             best: "Bajaj RE, TVS King",        speed: "40–50 km/h",  price: "Budget friendly" },
    { power: "5kW",   label: "5 kW Motor",   desc: "Standard commercial auto.",             best: "All standard 3-wheelers",   speed: "50–60 km/h",  price: "Mid range" },
    { power: "7.5kW", label: "7.5 kW Motor", desc: "Heavy duty for passenger auto.",        best: "Piaggio Ape, Mahindra Treo", speed: "60–70 km/h", price: "Premium" },
  ],
};

export default function StepF({ form, updateForm, nextStep, prevStep }: Props) {
  const motors = MOTORS[form.vehicleType] ?? MOTORS["car"];

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Select Motor Power
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Choose the motor power based on your vehicle and usage needs.
        Final recommendation given by dealer after on-site inspection.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {motors.map((m) => (
          <button
            key={m.power}
            onClick={() => updateForm({ motorPower: m.power })}
            style={{
              border: `2px solid ${
                form.motorPower === m.power ? "#a3e635" : "#14532d"
              }`,
            }}
            className={`w-full rounded-2xl p-4 text-left transition-all
              ${form.motorPower === m.power
                ? "bg-lime-400/10"
                : "bg-gw-900/50 hover:border-gw-600"
              }`}>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-black text-lime-400 text-lg">
                  {m.label}
                </span>
                <span style={{ border: "1px solid #14532d" }}
                  className="text-xs text-gw-400 px-2 py-0.5 rounded-lg">
                  {m.price}
                </span>
              </div>
              {form.motorPower === m.power && (
                <span className="text-lime-400 text-xl">✓</span>
              )}
            </div>

            <p className="text-gw-400 text-sm mb-2">{m.desc}</p>

            <div className="flex items-center gap-4 text-xs text-gw-500">
              <span>🚗 Best for: {m.best}</span>
              <span>⚡ Top speed: {m.speed}</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #14532d" }}
        className="bg-gw-900/30 rounded-xl px-4 py-3 mb-6">
        <p className="text-gw-400 text-xs leading-relaxed">
          <span className="text-white font-semibold">ℹ️ Note: </span>
          Motor selection is a preference — your dealer will confirm
          the best motor for your specific vehicle model after inspection.
        </p>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={nextStep}
          disabled={!form.motorPower}>
          Continue →
        </button>
      </div>
    </div>
  );
}
