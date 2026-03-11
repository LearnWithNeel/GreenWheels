import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DealerStatus = "pending" | "approved" | "rejected";

export interface IDealer extends Document {
  _id:             mongoose.Types.ObjectId;
  name:            string;
  email:           string;
  password:        string;
  phone:           string;
  garageName:      string;
  garageAddress: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };
  specialization:  string[];
  experience:      number;
  govtLicenseNo:   string;
  govtLicenseDoc?: string;
  profileImage?:   string;
  garageImages:    string[];

  // Admin approval
  status:          DealerStatus;
  approvedAt?:     Date;
  rejectedAt?:     Date;
  rejectionReason?: string;

  // OTP fields
  emailVerified:   boolean;
  otpCode?:        string;
  otpExpiry?:      Date;

  // Stats
  totalJobsCompleted: number;
  totalEarnings:      number;
  rating:             number;
  reviewCount:        number;

  isActive:    boolean;
  lastLoginAt?: Date;
  createdAt:   Date;
  updatedAt:   Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const DealerSchema = new Schema<IDealer>(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: {
      type:     String,
      required: [true, "Password is required"],
      minlength: 8,
      select:   false,
    },
    phone: {
      type:     String,
      required: [true, "Phone is required"],
      trim:     true,
    },
    garageName: {
      type:     String,
      required: [true, "Garage name is required"],
      trim:     true,
    },
    garageAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // What types of vehicles dealer can retrofit
    specialization: {
      type:    [String],
      enum:    ["car", "bike", "auto-rickshaw"],
      default: [],
    },

    experience:    { type: Number, default: 0, min: 0 },
    govtLicenseNo: { type: String, required: true, trim: true },
    govtLicenseDoc:{ type: String },
    profileImage:  { type: String },
    garageImages:  { type: [String], default: [] },

    // ── Admin approval ──
    // Dealer is invisible to customers until admin sets status to "approved"
    status:          { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    approvedAt:      { type: Date },
    rejectedAt:      { type: Date },
    rejectionReason: { type: String },

    // ── OTP ──
    emailVerified: { type: Boolean, default: false },
    otpCode:       { type: String, select: false },
    otpExpiry:     { type: Date },

    // ── Stats ──
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings:      { type: Number, default: 0 },
    rating:             { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:        { type: Number, default: 0 },

    isActive:    { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
DealerSchema.index({ email: 1 });
DealerSchema.index({ status: 1 });
DealerSchema.index({ "garageAddress.city": 1 });
DealerSchema.index({ specialization: 1 });

// ─── Auto hash password before saving ────────────────────────────────────────
DealerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// ─── Method to verify login password ─────────────────────────────────────────
DealerSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ─── Prevent duplicate model error on hot reload ──────────────────────────────
const Dealer: Model<IDealer> =
  mongoose.models.Dealer ?? mongoose.model<IDealer>("Dealer", DealerSchema);

export default Dealer;