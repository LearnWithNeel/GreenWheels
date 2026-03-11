import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "customer" | "admin";

export interface IUser extends Document {
  _id:               mongoose.Types.ObjectId;
  name:              string;
  email:             string;
  password?:         string;
  image?:            string;
  role:              UserRole;
  phone?:            string;
  address?: {
    street?:  string;
    city?:    string;
    state?:   string;
    pincode?: string;
  };
  emailVerified:     boolean;
  otpCode?:          string;
  otpExpiry?:        Date;
  isActive:          boolean;
  lastLoginAt?:      Date;
  createdAt:         Date;
  updatedAt:         Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
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
    // select:false means password is NEVER returned in queries by default
    // Must write .select("+password") to get it explicitly
    password: {
      type:      String,
      minlength: 8,
      select:    false,
    },
    image:   { type: String },
    role:    { type: String, enum: ["customer", "admin"], default: "customer" },
    phone:   { type: String, trim: true },
    address: {
      street:  { type: String },
      city:    { type: String },
      state:   { type: String },
      pincode: { type: String },
    },
    emailVerified: { type: Boolean, default: false },

    // OTP fields — stored temporarily, cleared after verification
    otpCode:   { type: String, select: false },
    otpExpiry: { type: Date },

    isActive:    { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// ─── Auto hash password before saving ────────────────────────────────────────
UserSchema.pre("save", async function (next) {
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
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ─── Prevent duplicate model error on hot reload ──────────────────────────────
const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;