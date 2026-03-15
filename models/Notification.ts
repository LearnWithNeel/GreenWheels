import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient:     mongoose.Types.ObjectId;
  recipientRole: "customer" | "dealer" | "admin";
  type:          string;
  title:         string;
  message:       string;
  orderId?:      mongoose.Types.ObjectId;
  read:          boolean;
  createdAt:     Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient:     { type: Schema.Types.ObjectId, required: true },
    recipientRole: { type: String, enum: ["customer", "dealer", "admin"], required: true },
    type:          { type: String, required: true },
    title:         { type: String, required: true },
    message:       { type: String, required: true },
    orderId:       { type: Schema.Types.ObjectId, ref: "RetrofitOrder" },
    read:          { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);