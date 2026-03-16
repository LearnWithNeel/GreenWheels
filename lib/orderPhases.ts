export const PHASES = [
  { phase: 1,  status: "inquiry_submitted",      label: "Inquiry Submitted",        actor: "customer" },
  { phase: 2,  status: "dealer_accepted",         label: "Dealer Accepted",          actor: "dealer"   },
  { phase: 3,  status: "verification_scheduled",  label: "Verification Scheduled",   actor: "dealer"   },
  { phase: 4,  status: "verification_ongoing",    label: "Verification In Progress", actor: "dealer"   },
  { phase: 5,  status: "verification_passed",     label: "Verification Passed",      actor: "dealer"   },
  { phase: 6,  status: "token_paid",              label: "Token Payment Done",       actor: "customer" },
  { phase: 7,  status: "pickup_scheduled",        label: "Pickup Scheduled",         actor: "dealer"   },
  { phase: 8,  status: "vehicle_picked_up",       label: "Vehicle Picked Up",        actor: "dealer"   },
  { phase: 9,  status: "retrofit_in_progress",    label: "Retrofit In Progress",     actor: "dealer"   },
  { phase: 10, status: "quality_check_done",      label: "Quality Check Done",       actor: "dealer"   },
  { phase: 11, status: "rto_filed",               label: "RTO & Form 22C Filed",     actor: "dealer"   },
  { phase: 12, status: "delivered",               label: "Delivered",                actor: "customer" },
];