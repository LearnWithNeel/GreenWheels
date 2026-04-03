import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Dealer from "@/models/Dealer";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const dealerId = (session.user as { id?: string }).id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "assigned";

    await connectDB();

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return NextResponse.json(
        { success: false, message: "Dealer not found." },
        { status: 404 }
      );
    }

    let orders;
    // let orders: any[] = [];

    if (type === "available") {
      // Orders in dealer's city that are not yet assigned
      orders = await RetrofitOrder.find({
        status: "inquiry_submitted",
        dealer: { $exists: false },
        "vehicle.type": { $in: dealer.specialization },
      })
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });
    } else if (type === "assigned") {
      // Orders assigned to this dealer
      orders = await RetrofitOrder.find({ dealer: dealerId })
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });
    } else if (type === "active") {
      // Active orders (not delivered/cancelled)
      orders = await RetrofitOrder.find({
        dealer: dealerId,
        status: {
          $nin: ["delivered", "cancelled", "verification_failed"],
        },
      })
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });
    } else if (type === "completed") {
      orders = await RetrofitOrder.find({
        dealer: dealerId,
        status: "delivered",
      })
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });
    } else {
      orders = [];
    }

    return NextResponse.json({ success: true, orders });

  } catch (error) {
    console.error("[API] dealer/orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}