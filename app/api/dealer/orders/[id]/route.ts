import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Notification from "@/models/Notification";
import { PHASES } from "@/lib/orderPhases";

export async function POST(
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

    const dealerId = (session.user as { id?: string }).id;
    const role     = (session.user as { role?: string }).role;

    if (role !== "dealer") {
      return NextResponse.json(
        { success: false, message: "Only dealers can perform this action." },
        { status: 403 }
      );
    }

    await connectDB();

    const { action, note, scheduledDate, estimatedAmount } = await req.json();
    const order = await RetrofitOrder.findById(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // ── Accept order ──────────────────────────────────────────────────────────
    if (action === "accept") {
      if (order.dealer) {
        return NextResponse.json(
          { success: false, message: "Order already accepted by another dealer." },
          { status: 400 }
        );
      }

      order.dealer = dealerId as unknown as typeof order.dealer;
      order.status = "dealer_accepted";
      order.history.push({
        status:    "dealer_accepted",
        note:      note || "Order accepted by dealer.",
        updatedAt: new Date(),
      });

      await order.save();

      // Notify customer
      if (order.customer) {
        await Notification.create({
          recipient:     order.customer,
          recipientRole: "customer",
          type:          "dealer_accepted",
          title:         "Dealer Accepted Your Order! 🎉",
          message:       `A verified dealer has accepted your retrofit inquiry ${order.orderNumber}. They will contact you shortly to schedule verification.`,
          orderId:       order._id,
          read:          false,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Order accepted successfully.",
        order,
      });
    }

    // ── Reject order ──────────────────────────────────────────────────────────
    if (action === "reject") {
      // Only assigned dealer can reject
      if (order.dealer?.toString() !== dealerId) {
        return NextResponse.json(
          { success: false, message: "You are not assigned to this order." },
          { status: 403 }
        );
      }

      order.dealer    = undefined as unknown as typeof order.dealer;
      order.status    = "inquiry_submitted";
      order.history.push({
        status:    "inquiry_submitted",
        note:      note || "Dealer rejected — order back to pool.",
        updatedAt: new Date(),
      });

      await order.save();

      return NextResponse.json({
        success: true,
        message: "Order rejected. It is back in the pool.",
      });
    }

    // ── Update phase ──────────────────────────────────────────────────────────
    if (action === "update_phase") {
      if (order.dealer?.toString() !== dealerId) {
        return NextResponse.json(
          { success: false, message: "You are not assigned to this order." },
          { status: 403 }
        );
      }

      const { newStatus } = await req.json().catch(() => ({ newStatus: null }));
      const phase = PHASES.find(p => p.status === (note || newStatus));

      const statusToSet = note || newStatus;
      order.status = statusToSet;
      order.history.push({
        status:    statusToSet,
        note:      phase?.label || statusToSet,
        updatedAt: new Date(),
      });

      if (scheduledDate)   order.scheduledDate           = scheduledDate;
      if (estimatedAmount) order.payment.totalAmount     = estimatedAmount;

      await order.save();

      // Notify customer
      if (order.customer) {
        await Notification.create({
          recipient:     order.customer,
          recipientRole: "customer",
          type:          statusToSet,
          title:         `Order Update: ${phase?.label || statusToSet}`,
          message:       `Your order ${order.orderNumber} has been updated to: ${phase?.label || statusToSet}.`,
          orderId:       order._id,
          read:          false,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Order updated to: ${phase?.label || statusToSet}`,
        order,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );

  } catch (error) {
    console.error("[API] dealer/orders/[id] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}