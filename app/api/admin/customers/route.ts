import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          role: "customer",
          $or: [
            { name:  { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : { role: "customer" };

    const total     = await User.countDocuments(query);
    const customers = await User.find(query)
      .select("-password -otpCode -otpExpiry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      customers,
      total,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("[API] admin/customers error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}