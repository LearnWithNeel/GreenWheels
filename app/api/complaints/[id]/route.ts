import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Complaint from "@/models/Complaint";

// ── GET — single complaint ─────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const complaint = await Complaint.findById(params.id);
    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, complaint });

  } catch (error) {
    console.error("[API] complaints/[id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── PATCH — update complaint status/notes ─────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const role = (session.user as { role?: string })?.role;
    const body = await req.json();

    const complaint = await Complaint.findById(params.id);
    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    // ── Support Agent actions ──
    if (role === "support_agent") {
      if (body.status)       complaint.status      = body.status;
      if (body.agentNotes)   complaint.agentNotes  = body.agentNotes;
      if (body.agentVerdict) {
        complaint.agentVerdict   = body.agentVerdict;
        complaint.agentVerdictAt = new Date();
        complaint.status         = "investigating";
      }
    }

    // ── Support Leader actions ──
    if (role === "support_leader") {
      if (body.status)       complaint.status       = body.status;
      if (body.leaderNotes)  complaint.leaderNotes  = body.leaderNotes;
      if (body.assignedTo) {
        complaint.assignedTo = body.assignedTo;
        complaint.assignedAt = new Date();
        complaint.status     = "under_review";
      }
      if (typeof body.leaderApproved !== "undefined") {
        complaint.leaderApproved   = body.leaderApproved;
        complaint.leaderApprovedAt = new Date();
        complaint.status           = body.leaderApproved
          ? "escalated"
          : "resolved";
      }
    }

    // ── Admin actions ──
    if (role === "admin") {
      if (body.adminAction) {
        complaint.adminAction   = body.adminAction;
        complaint.adminNotes    = body.adminNotes || "";
        complaint.adminActionAt = new Date();
        complaint.status        = "resolved";
        complaint.resolvedAt    = new Date();
        complaint.resolution    = body.resolution || "";
      }
      if (body.status) complaint.status = body.status;
    }

    await complaint.save();

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully.",
      complaint,
    });

  } catch (error) {
    console.error("[API] complaints/[id] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}