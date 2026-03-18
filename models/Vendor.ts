import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type VendorStatus = "pending" | "approved" | "rejected";

export interface IVendor extends Document {
  _id:          mongoose.Types.ObjectId;
  name:         string;
  email:        string;
  password:     string;
  phone:        string;
  businessName: string;
  businessType: "individual" | "company" | "brand";
  gstNumber:    string;
  gstDocument:  string;
  tradeLicense:  string;
  tradeLicenseDoc: string;
  araiApproval?:  string;
  araiApprovalDoc?: string;
  productCategories: string[];
  bankAccountName:   string;
  bankAccountNumber: string;
  bankIfsc:          string;
  address: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };
  profileImage?:  string;
  status:         VendorStatus;
  rejectionReason?: string;
  emailVerified:  boolean;
  otpCode?:       string;
  otpExpiry?:     Date;
  isActive:       boolean;
  totalProducts:  number;
  totalSales:     number;
  rating:         number;
  commissionRate: number;
  agreedToTerms:  boolean;
  createdAt:      Date;
  updatedAt:      Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const VendorSchema = new Schema<IVendor>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, minlength: 8, select: false },
    phone:        { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, enum: ["individual","company","brand"], required: true },
    gstNumber:    { type: String, required: true, trim: true },
    gstDocument:  { type: String, required: true },
    tradeLicense:    { type: String, default: "" },
    tradeLicenseDoc: { type: String, default: "" },
    araiApproval:    { type: String, default: "" },
    araiApprovalDoc: { type: String, default: "" },
    productCategories: { type: [String], default: [] },
    bankAccountName:   { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankIfsc:          { type: String, default: "" },
    address: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },
    profileImage:    { type: String },
    status:          { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    rejectionReason: { type: String, default: "" },
    emailVerified:   { type: Boolean, default: false },
    otpCode:         { type: String, select: false },
    otpExpiry:       { type: Date },
    isActive:        { type: Boolean, default: true },
    totalProducts:   { type: Number, default: 0 },
    totalSales:      { type: Number, default: 0 },
    rating:          { type: Number, default: 0, min: 0, max: 5 },
    commissionRate:  { type: Number, default: 10 },
    agreedToTerms:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

VendorSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err as Error); }
});

VendorSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const Vendor: Model<IVendor> =
  mongoose.models.Vendor ??
  mongoose.model<IVendor>("Vendor", VendorSchema);

export default Vendor;