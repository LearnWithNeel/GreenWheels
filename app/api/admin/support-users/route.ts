import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import SupportUser from "@/models/SupportUser";

// ── GET — list all support users ───────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();
    const users = await SupportUser.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });

  } catch (error) {
    console.error("[API] admin/support-users GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── POST — create support user ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { name, email, password, supportRole, phone } = await req.json();

    if (!name || !email || !password || !supportRole) {
      return NextResponse.json(
        { success: false, message: "All fields required." },
        { status: 400 }
      );
    }

    const existing = await SupportUser.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }

    const user = await SupportUser.create({
      name,
      email,
      password,
      role: supportRole,
      phone: phone || "",
    });

    return NextResponse.json({
      success: true,
      message: `${supportRole === "support_leader" ? "Leader" : "Agent"} created successfully.`,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (error) {
    console.error("[API] admin/support-users POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── DELETE — deactivate support user ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();
    const { userId } = await req.json();

    await SupportUser.findByIdAndUpdate(userId, { isActive: false });

    return NextResponse.json({
      success: true,
      message: "Support user deactivated.",
    });

  } catch (error) {
    console.error("[API] admin/support-users DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}