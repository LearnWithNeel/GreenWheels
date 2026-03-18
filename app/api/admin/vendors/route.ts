import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const query  = status === "all" ? {} : { status };
    const vendors = await Vendor.find(query)
      .select("-password -otpCode -otpExpiry")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    console.error("[API] admin/vendors GET error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    await connectDB();
    const { vendorId, action, rejectionReason } = await req.json();
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor not found." }, { status: 404 });
    }
    if (action === "approve") {
      vendor.status = "approved";
    } else if (action === "reject") {
      vendor.status          = "rejected";
      vendor.rejectionReason = rejectionReason || "";
    }
    await vendor.save();
    return NextResponse.json({
      success: true,
      message: `Vendor ${action}d successfully.`,
    });
  } catch (error) {
    console.error("[API] admin/vendors POST error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
  }
}