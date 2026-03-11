import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────
export type TransactionType =
  | "token_payment"
  | "final_payment"
  | "refund_full"
  | "refund_partial"
  | "commission";

export type TransactionStatus = "pending" | "success" | "failed";

export interface ITransaction extends Document {
  _id:             mongoose.Types.ObjectId;

  // ── Who paid / received ──
  paidBy:          mongoose.Types.ObjectId;
  paidByRole:      "customer" | "dealer";
  orderId:         mongoose.Types.ObjectId;
  orderNumber:     string;

  // ── What type of transaction ──
  type:            TransactionType;
  amount:          number;
  status:          TransactionStatus;

  // ── Razorpay details ──
  razorpayOrderId?:   string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // ── Refund details ──
  refundReason?:   string;
  refundedAt?:     Date;

  // ── Commission details ──
  commissionNote?: string;

  description:     string;
  createdAt:       Date;
  updatedAt:       Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const TransactionSchema = new Schema<ITransaction>(
  {
    paidBy: {
      type:     Schema.Types.ObjectId,
      required: true,
      // ref is either User or Dealer depending on paidByRole
    },
    paidByRole: {
      type:     String,
      enum:     ["customer", "dealer"],
      required: true,
    },
    orderId: {
      type:     Schema.Types.ObjectId,
      ref:      "RetrofitOrder",
      required: true,
    },
    orderNumber: {
      type:     String,
      required: true,
    },

    // ── Transaction type ──
    type: {
      type:     String,
      enum:     [
        "token_payment",
        "final_payment",
        "refund_full",
        "refund_partial",
        "commission",
      ],
      required: true,
    },

    amount: {
      type:     Number,
      required: true,
      min:      0,
    },
    status: {
      type:    String,
      enum:    ["pending", "success", "failed"],
      default: "pending",
    },

    // ── Razorpay ──
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    // ── Refund ──
    refundReason: { type: String },
    refundedAt:   { type: Date },

    // ── Commission ──
    commissionNote: { type: String },

    description: {
      type:     String,
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
TransactionSchema.index({ orderId: 1 });
TransactionSchema.index({ paidBy: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ razorpayPaymentId: 1 });

// ─── Prevent duplicate model error on hot reload ──────────────────────────────
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;