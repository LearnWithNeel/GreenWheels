import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type SupportRole = "support_agent" | "support_leader";

export interface ISupportUser extends Document {
  _id:        mongoose.Types.ObjectId;
  name:       string;
  email:      string;
  password:   string;
  role:       SupportRole;
  phone?:     string;
  isActive:   boolean;

  // ── Stats ──
  totalAssigned:  number;
  totalResolved:  number;
  totalEscalated: number;

  // ── Activity ──
  lastLoginAt?: Date;
  createdAt:    Date;
  updatedAt:    Date;

  comparePassword(candidate: string): Promise<boolean>;
}

const SupportUserSchema = new Schema<ISupportUser>(
  {
    name: {
      type:      String,
      required:  true,
      trim:      true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  true,
      minlength: 8,
      select:    false,
    },
    role: {
      type: String,
      enum: ["support_agent", "support_leader"],
      required: true,
    },
    phone:    { type: String },
    isActive: { type: Boolean, default: true },

    totalAssigned:  { type: Number, default: 0 },
    totalResolved:  { type: Number, default: 0 },
    totalEscalated: { type: Number, default: 0 },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

SupportUserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err as Error); }
});

SupportUserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const SupportUser: Model<ISupportUser> =
  mongoose.models.SupportUser ??
  mongoose.model<ISupportUser>("SupportUser", SupportUserSchema);

export default SupportUser;