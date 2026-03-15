import { PHASES } from "@/app/api/orders/[id]/status/route";

type HistoryItem = {
  status:    string;
  note:      string;
  updatedAt: string;
};

type Props = {
  currentStatus: string;
  history:       HistoryItem[];
};

const STATUS_ICONS: Record<string, string> = {
  inquiry_submitted:     "📋",
  dealer_accepted:       "🤝",
  verification_scheduled:"📅",
  verification_ongoing:  "🔍",
  verification_passed:   "✅",
  verification_failed:   "❌",
  token_paid:            "💰",
  pickup_scheduled:      "📍",
  vehicle_picked_up:     "🚗",
  retrofit_in_progress:  "⚡",
  quality_check_done:    "🛡️",
  rto_filed:             "📄",
  delivered:             "🎉",
  cancelled:             "🚫",
};

export default function OrderTimeline({ currentStatus, history }: Props) {
  const isCompleted = (phaseStatus: string) => {
    const currentIndex = PHASES.findIndex(p => p.status === currentStatus);
    const phaseIndex   = PHASES.findIndex(p => p.status === phaseStatus);
    return phaseIndex <= currentIndex;
  };

  const isCurrent = (phaseStatus: string) => phaseStatus === currentStatus;

  const getHistoryNote = (phaseStatus: string) => {
    return history
      .filter(h => h.status === phaseStatus)
      .pop();
  };

  // Handle special statuses
  if (currentStatus === "verification_failed") {
    return (
      <div style={{ border: "1px solid #991b1b" }}
        className="bg-red-900/20 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">❌</div>
        <h3 className="font-black text-white text-lg mb-2">
          Verification Failed
        </h3>
        <p className="text-red-400 text-sm">
          Your vehicle did not pass verification.
          No payment has been charged.
          Our team will contact you shortly.
        </p>
      </div>
    );
  }

  if (currentStatus === "cancelled") {
    return (
      <div style={{ border: "1px solid #991b1b" }}
        className="bg-red-900/20 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">🚫</div>
        <h3 className="font-black text-white text-lg mb-2">
          Order Cancelled
        </h3>
        <p className="text-red-400 text-sm">
          This order has been cancelled.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {PHASES.map((phase, index) => {
        const completed = isCompleted(phase.status);
        const current   = isCurrent(phase.status);
        const histNote  = getHistoryNote(phase.status);
        const isLast    = index === PHASES.length - 1;

        return (
          <div key={phase.status} className="flex gap-4">

            {/* ── Left — Icon + Line ── */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center
                justify-center text-lg shrink-0 transition-all
                ${current
                  ? "bg-lime-400 ring-4 ring-lime-400/30"
                  : completed
                  ? "bg-gw-800"
                  : "bg-gw-900 border border-gw-800"
                }`}>
                {completed || current
                  ? STATUS_ICONS[phase.status] || "✓"
                  : <span className="text-gw-700 text-xs font-bold">
                      {phase.phase}
                    </span>
                }
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-8 transition-all
                  ${completed ? "bg-lime-400/40" : "bg-gw-800"}`}
                />
              )}
            </div>

            {/* ── Right — Content ── */}
            <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-sm
                  ${current
                    ? "text-lime-400"
                    : completed
                    ? "text-white"
                    : "text-gw-600"
                  }`}>
                  Phase {phase.phase} — {phase.label}
                </span>
                {current && (
                  <span style={{ border: "1px solid #a3e635" }}
                    className="text-xs text-lime-400 px-2 py-0.5
                               rounded-lg bg-lime-400/10">
                    Current
                  </span>
                )}
              </div>

              {histNote && (
                <div className="text-gw-500 text-xs mb-1">
                  {histNote.note}
                </div>
              )}

              {histNote && (
                <div className="text-gw-700 text-xs">
                  {new Date(histNote.updatedAt).toLocaleDateString("en-IN", {
                    day:   "numeric",
                    month: "short",
                    year:  "numeric",
                    hour:  "2-digit",
                    minute:"2-digit",
                  })}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}