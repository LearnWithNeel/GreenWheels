import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Complaint from "@/models/Complaint";
import RetrofitOrder from "@/models/RetrofitOrder";

// ── GET — fetch complaints (admin/support only) ────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const role = (session?.user as { role?: string })?.role;

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "all";
        const priority = searchParams.get("priority") || "all";
        const type = searchParams.get("type") || "all";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;

        // Build query
        const query: Record<string, unknown> = {};
        if (status !== "all") query.status = status;
        if (priority !== "all") query.priority = priority;
        if (type !== "all") query.type = type;

        // Support agent — only see assigned complaints
        if (role === "support_agent") {
            const userId = (session?.user as { id?: string })?.id;
            query.assignedTo = userId;
        }

        const total = await Complaint.countDocuments(query);
        const complaints = await Complaint.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            complaints,
            total,
            pages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("[API] complaints GET error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}

// ── POST — file a new complaint (public) ──────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await auth();
        const userId = (session?.user as { id?: string })?.id;
        const role = (session?.user as { role?: string })?.role;

        // Validate
        const {
            complainantName,
            complainantEmail,
            type,
            against,
            againstId,
            againstName,
            orderNumber,
            subject,
            description,
            evidence,
            declarationAccepted,
            complaintCategory,
            complaintSubType,
        } = await req.json();

        // Validate
        if (!complainantName || !complainantEmail ||
            !type || !against || !subject || !description) {
            return NextResponse.json(
                { success: false, message: "All required fields must be filled." },
                { status: 400 }
            );
        }

        // Declaration required for dealer/vendor complaints
        if ((against === "dealer" || against === "vendor") && !declarationAccepted) {
            return NextResponse.json(
                { success: false, message: "You must accept the declaration to proceed." },
                { status: 400 }
            );
        }

        // Cooldown check — same user same dealer within 7 days
        if (against === "dealer" || against === "vendor") {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const existing = await Complaint.findOne({
                complainantEmail,
                againstId,
                createdAt: { $gte: sevenDaysAgo },
            });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "You have already filed a complaint against this party in the last 7 days." },
                    { status: 429 }
                );
            }
        }

        // Order verification for dealer complaints
        let orderVerified = false;
        if (against === "dealer" && orderNumber && userId) {
            const order = await RetrofitOrder.findOne({
                orderNumber,
                customer: userId,
            });
            orderVerified = !!order;
        }

        // Auto set priority based on type
        const priorityMap: Record<string, string> = {
            vendor_fraud: "critical",
            fake_parts: "critical",
            dealer_misconduct: "high",
            payment_dispute: "high",
            product_quality: "medium",
            delivery_issue: "medium",
            customer_harassment: "high",
            other: "low",
        };

        const complaint = await Complaint.create({
            complainantName,
            complainantEmail,
            complainantRole: role || "guest",
            complainantId: userId || undefined,
            type,
            against,
            againstId: againstId || "",
            againstName: againstName || "",
            orderNumber: orderNumber || "",
            subject,
            description,
            evidence: evidence || [],
            status: "open",
            priority: priorityMap[type] || "medium",
            declarationAccepted: declarationAccepted || false,
            orderVerified,
        });

        return NextResponse.json({
            success: true,
            message: "Complaint filed successfully. Our support team will review it within 48 hours.",
            complaintId: complaint._id,
        });

    } catch (error) {
        console.error("[API] complaints POST error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}