import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrderPhase =
  | "pending"
  | "dealer_approved"
  | "verification_in_progress"
  | "verification_failed"
  | "verification_passed"
  | "token_payment_done"
  | "vehicle_picked_up"
  | "under_process"
  | "ready_to_deliver"
  | "final_payment_done"
  | "delivered"
  | "settlement_pending"
  | "completed";

export type VehicleType   = "car" | "bike" | "auto-rickshaw";
export type RetrofitType  = "pure-electric" | "hybrid";
export type PaymentStatus = "pending" | "paid" | "refunded" | "partial";

export interface IRetrofitOrder extends Document {
  _id:         mongoose.Types.ObjectId;
  orderNumber: string;

  // ── Parties ──
  customerId: mongoose.Types.ObjectId;
  dealerId?:  mongoose.Types.ObjectId;

  // ── Vehicle Details (filled in form steps A-D) ──
  vehicle: {
    type:          VehicleType;
    name:          string;
    brand:         string;
    model:         string;
    yearOfPurchase: number;
    kmDriven:      number;
    images: {
      front: string;
      back:  string;
      left:  string;
      right: string;
    };
    ownershipProof: string;
  };

  // ── Retrofit Selection (form steps E-G) ──
  retrofit: {
    type:        RetrofitType;
    motorSpec:   string;
    batteryType: string;
    estimatedRange: number;
  };

  // ── Dealer Quote ──
  quote?: {
    amount:    number;
    note?:     string;
    sentAt:    Date;
  };

  // ── Payment ──
  payment: {
    totalAmount:       number;
    tokenAmount:       number;
    finalAmount:       number;
    tokenPaid:         boolean;
    finalPaid:         boolean;
    tokenPaidAt?:      Date;
    finalPaidAt?:      Date;
    tokenRazorpayId?:  string;
    finalRazorpayId?:  string;
    refundAmount?:     number;
    refundedAt?:       Date;
    refundRazorpayId?: string;
    status:            PaymentStatus;
  };

  // ── Verification ──
  verification: {
    scheduledAt?:  Date;
    completedAt?:  Date;
    result?:       "passed" | "failed";
    rejectionCode?: string;
    rejectionNote?: string;
    verifierName?:  string;
  };

  // ── Order Phase + History ──
  phase: OrderPhase;
  history: Array<{
    phase:     OrderPhase;
    note?:     string;
    changedAt: Date;
  }>;

  // ── Cancellation ──
  cancelledAt?:    Date;
  cancelledBy?:    "customer" | "system";
  cancelReason?:   string;

  // ── Addresses ──
  pickupAddress: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };

  // ── Commission ──
  commission: {
    amount:        number;
    isPaid:        boolean;
    paidAt?:       Date;
    proofImageUrl?: string;
    confirmedByAdmin: boolean;
  };

  // ── Bill ──
  billUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const RetrofitOrderSchema = new Schema<IRetrofitOrder>(
  {
    orderNumber: {
      type:     String,
      required: true,
      unique:   true,
    },

    customerId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    dealerId: {
      type: Schema.Types.ObjectId,
      ref:  "Dealer",
    },

    // ── Vehicle ──
    vehicle: {
      type:           { type: String, enum: ["car","bike","auto-rickshaw"], required: true },
      name:           { type: String, required: true, trim: true },
      brand:          { type: String, required: true, trim: true },
      model:          { type: String, required: true, trim: true },
      yearOfPurchase: { type: Number, required: true },
      kmDriven:       { type: Number, required: true, min: 0 },
      images: {
        front: { type: String, required: true },
        back:  { type: String, required: true },
        left:  { type: String, required: true },
        right: { type: String, required: true },
      },
      ownershipProof: { type: String, required: true },
    },

    // ── Retrofit ──
    retrofit: {
      type:           { type: String, enum: ["pure-electric","hybrid"], required: true },
      motorSpec:      { type: String, required: true },
      batteryType:    { type: String, required: true },
      estimatedRange: { type: Number, required: true },
    },

    // ── Quote ──
    quote: {
      amount: { type: Number, min: 0 },
      note:   { type: String },
      sentAt: { type: Date },
    },

    // ── Payment ──
    payment: {
      totalAmount:      { type: Number, default: 0 },
      tokenAmount:      { type: Number, default: 0 },
      finalAmount:      { type: Number, default: 0 },
      tokenPaid:        { type: Boolean, default: false },
      finalPaid:        { type: Boolean, default: false },
      tokenPaidAt:      { type: Date },
      finalPaidAt:      { type: Date },
      tokenRazorpayId:  { type: String },
      finalRazorpayId:  { type: String },
      refundAmount:     { type: Number },
      refundedAt:       { type: Date },
      refundRazorpayId: { type: String },
      status:           { type: String, enum: ["pending","paid","refunded","partial"], default: "pending" },
    },

    // ── Verification ──
    verification: {
      scheduledAt:    { type: Date },
      completedAt:    { type: Date },
      result:         { type: String, enum: ["passed","failed"] },
      rejectionCode:  { type: String },
      rejectionNote:  { type: String },
      verifierName:   { type: String },
    },

    // ── Phase + History ──
    phase: {
      type:    String,
      enum:    [
        "pending",
        "dealer_approved",
        "verification_in_progress",
        "verification_failed",
        "verification_passed",
        "token_payment_done",
        "vehicle_picked_up",
        "under_process",
        "ready_to_deliver",
        "final_payment_done",
        "delivered",
        "settlement_pending",
        "completed",
      ],
      default: "pending",
    },
    history: [
      {
        phase:     { type: String, required: true },
        note:      { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Cancellation ──
    cancelledAt:  { type: Date },
    cancelledBy:  { type: String, enum: ["customer","system"] },
    cancelReason: { type: String },

    // ── Pickup Address ──
    pickupAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // ── Commission ──
    commission: {
      amount:           { type: Number, default: 0 },
      isPaid:           { type: Boolean, default: false },
      paidAt:           { type: Date },
      proofImageUrl:    { type: String },
      confirmedByAdmin: { type: Boolean, default: false },
    },

    billUrl: { type: String },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
RetrofitOrderSchema.index({ customerId: 1, createdAt: -1 });
RetrofitOrderSchema.index({ dealerId: 1, createdAt: -1 });
RetrofitOrderSchema.index({ phase: 1 });
RetrofitOrderSchema.index({ orderNumber: 1 });

// ─── Auto generate order number before save ───────────────────────────────────
// Format: GW-20260311-AB3F
RetrofitOrderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const date   = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const random = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
    this.orderNumber = `GW-${date}-${random}`;
  }

  // Auto add first history entry on new order
  if (this.isNew && this.history.length === 0) {
    this.history.push({
      phase:     "pending",
      note:      "Order submitted by customer",
      changedAt: new Date(),
    });
  }
  next();
});

// ─── Prevent duplicate model error on hot reload ──────────────────────────────
const RetrofitOrder: Model<IRetrofitOrder> =
  mongoose.models.RetrofitOrder ??
  mongoose.model<IRetrofitOrder>("RetrofitOrder", RetrofitOrderSchema);

export default RetrofitOrder;