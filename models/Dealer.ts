import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DealerStatus = "pending" | "approved" | "rejected";

export interface IDealer extends Document {
  _id:             mongoose.Types.ObjectId;

  // ── Auth ──
  name:            string;
  email:           string;
  password:        string;
  phone:           string;

  // ── Business Info ──
  garageName:      string;
  garageAddress: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };

  // ── Specialization & Experience ──
  specialization:  string[];
  experience:      number;

  // ── Documents & Media ──
  govtLicenseNo:   string;
  govtLicenseDoc?: string;
  govtIdType:      string;
  profileImage?:   string;
  garageImages:    string[];
  workshopPhotos:  string[];
  certifications:  string[];

  // ── Admin Approval ──
  status:           DealerStatus;
  approvedAt?:      Date;
  rejectedAt?:      Date;
  rejectionReason?: string;
  rejectionNote:    string;

  // ── OTP & Verification ──
  emailVerified:   boolean;
  otpCode?:        string;
  otpExpiry?:      Date;

  // ── Stats ──
  totalJobsCompleted: number;
  totalEarnings:      number;
  rating:             number;
  reviewCount:        number;
  totalOrders:        number;

  // ── Activity ──
  isActive:     boolean;
  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const DealerSchema = new Schema<IDealer>(
  {
    // ── Auth ──
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
      type:      String,
      required:  [true, "Password is required"],
      minlength: 8,
      select:    false,
    },
    phone: {
      type:     String,
      required: [true, "Phone is required"],
      trim:     true,
    },

    // ── Business Info ──
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

    // ── Specialization & Experience ──
    specialization: {
      type:    [String],
      enum:    ["car", "bike", "auto-rickshaw"],
      default: [],
    },
    experience: { type: Number, default: 0, min: 0 },

    // ── Documents & Media ──
    govtLicenseNo:  { type: String, required: true, trim: true },
    govtLicenseDoc: { type: String },
    govtIdType:     { type: String, default: "" },
    profileImage:   { type: String },
    garageImages:   { type: [String], default: [] },
    workshopPhotos: { type: [String], default: [] },
    certifications: { type: [String], default: [] },

    // ── Admin Approval ──
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt:      { type: Date },
    rejectedAt:      { type: Date },
    rejectionReason: { type: String },
    rejectionNote:   { type: String, default: "" },

    // ── OTP & Verification ──
    emailVerified: { type: Boolean, default: false },
    otpCode:       { type: String,  select: false },
    otpExpiry:     { type: Date },

    // ── Stats ──
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings:      { type: Number, default: 0 },
    rating:             { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:        { type: Number, default: 0 },
    totalOrders:        { type: Number, default: 0 },

    // ── Activity ──
    isActive:    { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
DealerSchema.index({ status: 1 });
DealerSchema.index({ "garageAddress.city": 1 });
DealerSchema.index({ specialization: 1 });

// ─── Auto hash password before saving ─────────────────────────────────────────
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

// ─── Method to verify login password ──────────────────────────────────────────
DealerSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ─── Prevent duplicate model error on hot reload ───────────────────────────────
const Dealer: Model<IDealer> =
  mongoose.models.Dealer ??
  mongoose.model<IDealer>("Dealer", DealerSchema);

export default Dealer;