type Props = {
  status: string;
};

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg:    string;
  border:string;
}> = {
  inquiry_submitted:      { label: "Inquiry Submitted",        color: "#93c5fd", bg: "#1e3a5f", border: "#1d4ed8" },
  dealer_accepted:        { label: "Dealer Accepted",          color: "#86efac", bg: "#14532d", border: "#15803d" },
  verification_scheduled: { label: "Verification Scheduled",   color: "#fde68a", bg: "#713f12", border: "#d97706" },
  verification_ongoing:   { label: "Verification Ongoing",     color: "#fde68a", bg: "#713f12", border: "#d97706" },
  verification_passed:    { label: "Verification Passed",      color: "#a3e635", bg: "#1a3a0a", border: "#65a30d" },
  verification_failed:    { label: "Verification Failed",      color: "#fca5a5", bg: "#450a0a", border: "#991b1b" },
  token_paid:             { label: "Token Paid",               color: "#a3e635", bg: "#1a3a0a", border: "#65a30d" },
  pickup_scheduled:       { label: "Pickup Scheduled",         color: "#fde68a", bg: "#713f12", border: "#d97706" },
  vehicle_picked_up:      { label: "Vehicle Picked Up",        color: "#fde68a", bg: "#713f12", border: "#d97706" },
  retrofit_in_progress:   { label: "Retrofit In Progress",     color: "#c4b5fd", bg: "#2e1065", border: "#7c3aed" },
  quality_check_done:     { label: "Quality Check Done",       color: "#a3e635", bg: "#1a3a0a", border: "#65a30d" },
  rto_filed:              { label: "RTO & Form 22C Filed",     color: "#a3e635", bg: "#1a3a0a", border: "#65a30d" },
  delivered:              { label: "Delivered 🎉",             color: "#a3e635", bg: "#1a3a0a", border: "#65a30d" },
  cancelled:              { label: "Cancelled",                color: "#fca5a5", bg: "#450a0a", border: "#991b1b" },
  pending:                { label: "Pending",                  color: "#fde68a", bg: "#713f12", border: "#d97706" },
};

export default function OrderStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label:  status,
    color:  "#86efac",
    bg:     "#14532d",
    border: "#15803d",
  };

  return (
    <span
      style={{
        color:           config.color,
        background:      config.bg,
        border:          `1px solid ${config.border}`,
        display:         "inline-block",
        padding:         "2px 10px",
        borderRadius:    "8px",
        fontSize:        "12px",
        fontWeight:      "600",
        whiteSpace:      "nowrap",
      }}>
      {config.label}
    </span>
  );
}