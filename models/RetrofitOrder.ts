import mongoose, { Schema, Document } from "mongoose";

export interface IRetrofitOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  dealer?: mongoose.Types.ObjectId;
  scheduledDate?: Date;
  status: string;
  vehicle: {
    type: string;
    brand: string;
    model: string;
    year: number;
    registrationNumber: string;
    color: string;
    fuelType: string;
    kmDriven: number;
    photos: {
      front: string;
      back: string;
      left: string;
      right: string;
    };
  };
  ownership: {
    ownerName: string;
    ownerAddress: string;
    rcDocument: string;
  };
  retrofit: {
    type: string;
    motorPower: string;
    batteryCapacity: string;
    expectedRange: string;
    chargingType: string;
    specialRequests: string;
  };
  payment: {
    totalAmount: number;
    tokenAmount: number;
    finalAmount: number;
    tokenPaid: boolean;
    finalPaid: boolean;
  };
  history: {
    status: string;
    note: string;
    updatedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const RetrofitOrderSchema = new Schema<IRetrofitOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      type: Schema.Types.ObjectId, ref: "User",
      customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
      dealer: { type: Schema.Types.ObjectId, ref: "Dealer" },
      scheduledDate: { type: Date },
      required: true
    },
    status: { type: String, default: "pending" },

    vehicle: {
      type: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      registrationNumber: { type: String, required: true },
      color: { type: String, required: true },
      fuelType: { type: String, required: true },
      kmDriven: { type: Number, required: true },
      photos: {
        front: { type: String, required: true },
        back: { type: String, required: true },
        left: { type: String, required: true },
        right: { type: String, required: true },
      },
    },

    ownership: {
      ownerName: { type: String, required: true },
      ownerAddress: { type: String, required: true },
      rcDocument: { type: String, required: true },
    },

    retrofit: {
      type: { type: String, required: true },
      motorPower: { type: String, required: true },
      batteryCapacity: { type: String, required: true },
      expectedRange: { type: String, required: true },
      chargingType: { type: String, required: true },
      specialRequests: { type: String, default: "" },
    },

    payment: {
      totalAmount: { type: Number, default: 0 },
      tokenAmount: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 },
      tokenPaid: { type: Boolean, default: false },
      finalPaid: { type: Boolean, default: false },
    },

    history: [{
      status: { type: String, required: true },
      note: { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Force delete cached model to pick up new schema
if (mongoose.models.RetrofitOrder) {
  delete (mongoose.models as Record<string, unknown>).RetrofitOrder;
}

export default mongoose.model<IRetrofitOrder>("RetrofitOrder", RetrofitOrderSchema);