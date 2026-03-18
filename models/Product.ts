import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  _id:          mongoose.Types.ObjectId;
  vendor:       mongoose.Types.ObjectId;
  vendorName:   string;
  name:         string;
  brand:        string;
  category:     "kit" | "battery" | "motor" | "charger" | "safety" | "accessory";
  vehicle:      string[];
  price:        number;
  mrp:          number;
  stock:        number;
  images:       string[];
  description:  string;
  specs:        { label: string; value: string }[];
  araiApproved: boolean;
  araiCertNo?:  string;
  bisApproved:  boolean;
  bisCertNo?:   string;
  hsnCode:      string;
  warranty:     string;
  countryOfOrigin: string;
  isActive:     boolean;
  isApproved:   boolean;
  rejectionReason?: string;
  rating:       number;
  reviewCount:  number;
  totalSold:    number;
  createdAt:    Date;
  updatedAt:    Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    vendor:     { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    vendorName: { type: String, required: true },
    name:       { type: String, required: true, trim: true },
    brand:      { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["kit","battery","motor","charger","safety","accessory"],
      required: true,
    },
    vehicle:     { type: [String], default: [] },
    price:       { type: Number, required: true, min: 0 },
    mrp:         { type: Number, required: true, min: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    images:      { type: [String], default: [] },
    description: { type: String, required: true },
    specs:       [{ label: String, value: String }],
    araiApproved: { type: Boolean, default: false },
    araiCertNo:   { type: String, default: "" },
    bisApproved:  { type: Boolean, default: false },
    bisCertNo:    { type: String, default: "" },
    hsnCode:      { type: String, default: "" },
    warranty:     { type: String, default: "" },
    countryOfOrigin: { type: String, default: "India" },
    isActive:     { type: Boolean, default: true },
    isApproved:   { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:  { type: Number, default: 0 },
    totalSold:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ vendor: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isApproved: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ??
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;