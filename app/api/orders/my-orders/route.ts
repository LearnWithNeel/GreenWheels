import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";

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

    let orders;

    if (role === "customer") {
      orders = await RetrofitOrder.find({ customer: userId })
        .sort({ createdAt: -1 })
        .select("-ownership.rcDocument");
    } else if (role === "dealer") {
      orders = await RetrofitOrder.find({ dealer: userId })
        .sort({ createdAt: -1 })
        .populate("customer", "name email phone");
    } else if (role === "admin") {
      orders = await RetrofitOrder.find({})
        .sort({ createdAt: -1 })
        .populate("customer", "name email phone")
        .populate("dealer",   "name email garageName");
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid role." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, orders });

  } catch (error) {
    console.error("[API] my-orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}