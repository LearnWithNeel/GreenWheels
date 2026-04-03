import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";

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
    const status = searchParams.get("status") || "all";
    const page   = parseInt(searchParams.get("page") || "1");
    const limit  = 20;

    const query = status === "all" ? {} : { status };

    const total  = await RetrofitOrder.countDocuments(query);
    const orders = await RetrofitOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customer", "name email phone")
      .populate("dealer",   "name garageName");

    return NextResponse.json({
      success: true,
      orders,
      total,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("[API] admin/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}