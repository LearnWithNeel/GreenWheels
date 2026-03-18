import mongoose, { Schema, Document } from "mongoose";

export type ComplaintStatus =
    | "open"
    | "under_review"
    | "investigating"
    | "resolved"
    | "dismissed"
    | "escalated";

export type ComplaintType =
    | "product_quality"
    | "dealer_misconduct"
    | "fake_parts"
    | "payment_dispute"
    | "delivery_issue"
    | "customer_harassment"
    | "vendor_fraud"
    | "other";

export type ComplaintAgainst =
    | "dealer"
    | "vendor"
    | "product"
    | "platform"
    | "customer";

export interface IComplaint extends Document {
    // ── Complainant ──
    complainantName: string;
    complainantEmail: string;
    complainantRole: "customer" | "dealer" | "vendor" | "guest";
    complainantId?: mongoose.Types.ObjectId;

    // ── Complaint Details ──
    type: ComplaintType;
    against: ComplaintAgainst;
    againstId?: string;
    againstName?: string;
    orderNumber?: string;
    subject: string;
    description: string;
    evidence: string[];

    // ── Status & Assignment ──
    status: ComplaintStatus;
    assignedTo?: mongoose.Types.ObjectId;
    assignedAt?: Date;

    // ── Investigation ──
    agentNotes: string;
    agentVerdict?: "guilty" | "not_guilty" | "partial";
    agentVerdictAt?: Date;

    // ── Leader Review ──
    leaderNotes: string;
    leaderApproved?: boolean;
    leaderApprovedAt?: Date;

    // ── Admin Action ──
    adminAction?: "warning" | "suspension" | "ban" | "refund" | "cleared";
    adminNotes: string;
    adminActionAt?: Date;

    // ── Resolution ──
    resolvedAt?: Date;
    resolution?: string;

    // ── Priority ──
    priority: "low" | "medium" | "high" | "critical";
    declarationAccepted: boolean;
    orderVerified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
    {
        complainantName: { type: String, required: true },
        complainantEmail: { type: String, required: true },
        complainantRole: {
            type: String,
            enum: ["customer", "dealer", "vendor", "guest"],
            default: "guest",
        },
        complainantId: { type: Schema.Types.ObjectId },

        type: {
            type: String,
            enum: [
                "product_quality", "dealer_misconduct", "fake_parts",
                "payment_dispute", "delivery_issue", "customer_harassment",
                "vendor_fraud", "other",
            ],
            required: true,
        },
        against: {
            type: String,
            enum: ["dealer", "vendor", "product", "platform", "customer"],
            required: true,
        },
        againstId: { type: String },
        againstName: { type: String },
        orderNumber: { type: String },
        subject: { type: String, required: true },
        description: { type: String, required: true },
        evidence: { type: [String], default: [] },

        status: {
            type: String,
            enum: [
                "open", "under_review", "investigating",
                "resolved", "dismissed", "escalated",
            ],
            default: "open",
        },
        assignedTo: { type: Schema.Types.ObjectId },
        assignedAt: { type: Date },

        agentNotes: { type: String, default: "" },
        agentVerdict: { type: String, enum: ["guilty", "not_guilty", "partial"] },
        agentVerdictAt: { type: Date },

        leaderNotes: { type: String, default: "" },
        leaderApproved: { type: Boolean },
        leaderApprovedAt: { type: Date },

        adminAction: {
            type: String,
            enum: ["warning", "suspension", "ban", "refund", "cleared"],
        },
        adminNotes: { type: String, default: "" },
        adminActionAt: { type: Date },

        resolvedAt: { type: Date },
        resolution: { type: String, default: "" },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        declarationAccepted: { type: Boolean, default: false },
        orderVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ complainantEmail: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ createdAt: -1 });

export default mongoose.models.Complaint ||
    mongoose.model<IComplaint>("Complaint", ComplaintSchema);