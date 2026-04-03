import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form: RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "LPG", "Petrol + CNG"];

const YEARS = Array.from({ length: 30 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

export default function StepB({ form, updateForm, nextStep, prevStep }: Props) {
  const valid =
    form.brand &&
    form.model &&
    form.year &&
    form.registrationNumber &&
    form.color &&
    form.fuelType &&
    form.kmDriven;

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Tell us about your vehicle
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Fill in your vehicle details accurately — these are verified on-site.
      </p>

      <div className="flex flex-col gap-4 mb-8">

        {/* Brand + Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Brand</label>
            <input className="input" placeholder="e.g. Maruti, Honda"
              value={form.brand}
              onChange={e => updateForm({ brand: e.target.value })} />
          </div>
          <div>
            <label className="label">Model</label>
            <input className="input" placeholder="e.g. Alto, Activa"
              value={form.model}
              onChange={e => updateForm({ model: e.target.value })} />
          </div>
        </div>

        {/* Year + Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Year of Manufacture</label>
            <select className="input"
              value={form.year}
              onChange={e => updateForm({ year: e.target.value })}>
              <option value="">Select Year</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vehicle Color</label>
            <input className="input" placeholder="e.g. White, Red"
              value={form.color}
              onChange={e => updateForm({ color: e.target.value })} />
          </div>
        </div>

        {/* Registration Number */}
        <div>
          <label className="label">Registration Number</label>
          <input className="input uppercase" placeholder="e.g. GJ06AB1234"
            value={form.registrationNumber}
            onChange={e => updateForm({
              registrationNumber: e.target.value.toUpperCase().trim()
            })} />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="label">Current Fuel Type</label>
          <select className="input"
            value={form.fuelType}
            onChange={e => updateForm({ fuelType: e.target.value })}>
            <option value="">Select Fuel Type</option>
            {FUEL_TYPES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* KM Driven */}
        <div>
          <label className="label">Total KM Driven</label>
          <input className="input" type="number" placeholder="e.g. 45000"
            value={form.kmDriven}
            onChange={e => updateForm({ kmDriven: e.target.value })} />
          <p className="text-gw-600 text-xs mt-1">
            Approximate is fine — verified on-site.
          </p>
        </div>

      </div>

      {/* Navigation */}
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