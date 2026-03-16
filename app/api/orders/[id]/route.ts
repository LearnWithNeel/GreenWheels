import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";

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

    const order = await RetrofitOrder.findById(params.id)
  .populate("customer", "name email phone");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Only allow customer who owns it, assigned dealer, or admin
    const userId = (session.user as { id?: string }).id;
    const role   = (session.user as { role?: string }).role;

    if (
      role !== "admin" &&
      order.customer?._id?.toString() !== userId &&
      order.dealer?.toString()        !== userId
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("[API] orders/[id] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}