import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

// ── GET — fetch notifications for logged in user ───────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = (session.user as { id?: string }).id;
    const role   = (session.user as { role?: string }).role;

    const notifications = await Notification.find({
      recipient:     userId,
      recipientRole: role,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient:     userId,
      recipientRole: role,
      read:          false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });

  } catch (error) {
    console.error("[API] notifications GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── POST — mark notifications as read ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { notificationId } = await req.json();
    const userId = (session.user as { id?: string }).id;

    if (notificationId === "all") {
      // Mark all as read
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
    } else {
      // Mark single as read
      await Notification.findByIdAndUpdate(
        notificationId,
        { read: true }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API] notifications POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}