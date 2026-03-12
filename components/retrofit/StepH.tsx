import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  prevStep:   () => void;
  onSubmit:   () => void;
  submitting: boolean;
};

const VEHICLE_LABELS: Record<string, string> = {
  car:  "🚗 Car",
  bike: "🏍️ Bike / Scooter",
  auto: "🛺 Auto-Rickshaw",
};

const RETROFIT_LABELS: Record<string, string> = {
  pure_electric: "⚡ Pure Electric",
  hybrid:        "🔋 Hybrid",
};

const CHARGING_LABELS: Record<string, string> = {
  standard: "🔌 Standard Charging",
  fast:     "⚡ Fast Charging",
  both:     "🔋 Both Options",
};

export default function StepH({
  form, updateForm, prevStep, onSubmit, submitting
}: Props) {
  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Review & Submit
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Review all details before submitting your retrofit inquiry.
        You can go back to edit anything.
      </p>

      <div className="flex flex-col gap-4 mb-6">

        {/* Vehicle Info */}
        <ReviewSection title="🚗 Vehicle Information">
          <ReviewRow label="Type"                value={VEHICLE_LABELS[form.vehicleType]} />
          <ReviewRow label="Brand & Model"       value={`${form.brand} ${form.model}`} />
          <ReviewRow label="Year"                value={form.year} />
          <ReviewRow label="Registration"        value={form.registrationNumber} />
          <ReviewRow label="Color"               value={form.color} />
          <ReviewRow label="Fuel Type"           value={form.fuelType} />
          <ReviewRow label="KM Driven"           value={`${form.kmDriven} km`} />
        </ReviewSection>

        {/* Photos */}
        <ReviewSection title="📷 Vehicle Photos">
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              { url: form.photoFront, label: "Front" },
              { url: form.photoBack,  label: "Back" },
              { url: form.photoLeft,  label: "Left" },
              { url: form.photoRight, label: "Right" },
            ].map(({ url, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <img src={url} alt={label}
                  className="w-full h-16 object-cover rounded-lg" />
                <span className="text-gw-500 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Ownership */}
        <ReviewSection title="📄 Ownership">
          <ReviewRow label="Owner Name"    value={form.ownerName} />
          <ReviewRow label="Address"       value={form.ownerAddress} />
          <ReviewRow label="RC Document"
            value={
              <a href={form.rcDocument} target="_blank"
                className="text-lime-400 hover:underline text-xs">
                View Document ↗
              </a>
            }
          />
        </ReviewSection>

        {/* Retrofit Specs */}
        <ReviewSection title="⚡ Retrofit Specifications">
          <ReviewRow label="Retrofit Type"    value={RETROFIT_LABELS[form.retrofitType]} />
          <ReviewRow label="Motor Power"      value={form.motorPower} />
          <ReviewRow label="Battery Capacity" value={form.batteryCapacity} />
          <ReviewRow label="Expected Range"   value={form.expectedRange} />
          <ReviewRow label="Charging Type"    value={CHARGING_LABELS[form.chargingType]} />
        </ReviewSection>

        {/* Special Requests */}
        <div>
          <label className="label">Special Requests (Optional)</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Any specific requirements or questions for the dealer..."
            value={form.specialRequests}
            onChange={e => updateForm({ specialRequests: e.target.value })}
          />
        </div>

        {/* Important Notice */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-xl px-4 py-3">
          <p className="text-gw-400 text-xs leading-relaxed">
            <span className="text-white font-semibold">⚠️ Important: </span>
            Submitting this inquiry is free. No payment is collected at this
            stage. Payment of 30% token is only requested
            <strong className="text-white"> after on-site verification
            passes</strong>. If verification fails — zero rupees are charged.
          </p>
        </div>

      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}
          disabled={submitting}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={onSubmit}
          disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Inquiry 🚀"}
        </button>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────
function ReviewSection({
  title, children
}: {
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #14532d" }}
      className="bg-gw-900/50 rounded-xl p-4">
      <h3 className="font-bold text-white text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ReviewRow({
  label, value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1
                    border-b border-gw-900 last:border-0">
      <span className="text-gw-500 text-xs shrink-0">{label}</span>
      <span className="text-gw-300 text-xs text-right">{value}</span>
    </div>
  );
}