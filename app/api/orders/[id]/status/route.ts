import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Notification from "@/models/Notification";
import Dealer from "@/models/Dealer";
import User from "@/models/User";
import { sendOrderStatusEmail } from "@/lib/email";

// ── Phase definitions ─────────────────────────────────────────────────────────
import { PHASES } from "@/lib/orderPhases";

// ── Special status ────────────────────────────────────────────────────────────
const TERMINAL_STATUSES = ["delivered", "verification_failed", "cancelled"];

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

    await connectDB();

    const { status, note, scheduledDate, estimatedAmount } = await req.json();
    const role = (session.user as { role?: string }).role;
    const userId = (session.user as { id?: string }).id;

    const order = await RetrofitOrder.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Prevent updating terminal orders
    if (TERMINAL_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { success: false, message: "This order is already completed or cancelled." },
        { status: 400 }
      );
    }

    // Find phase info
    const phaseInfo = PHASES.find(p => p.status === status);

    // Update order status
    order.status = status;

    // Add to history
    order.history.push({
      status,
      note: note || phaseInfo?.label || status,
      updatedAt: new Date(),
    });

    // Handle special fields
    if (scheduledDate) order.scheduledDate = scheduledDate;
    if (estimatedAmount) order.payment.totalAmount = estimatedAmount;

    // Handle verification failed
    if (status === "verification_failed") {
      order.status = "verification_failed";
    }

    // Handle cancellation
    if (status === "cancelled") {
      order.status = "cancelled";
    }

    await order.save();

    // After order.save(), get customer email:
    const customer = await User.findById(order.customer).select("email name");
    if (customer) {
      await sendOrderStatusEmail({
        to: customer.email,
        name: customer.name,
        orderNumber: order.orderNumber,
        status,
        orderId: order._id.toString(),
      });
    }

    // ── Send notifications ──────────────────────────────────────────────────
    const notifData = getNotificationData(status, order.orderNumber);

    // Notify customer
    if (notifData.customer && order.customer) {
      await Notification.create({
        recipient: order.customer,
        recipientRole: "customer",
        type: status,
        title: notifData.customer.title,
        message: notifData.customer.message,
        orderId: order._id,
        read: false,
      });
    }

    // Notify dealer
    if (notifData.dealer && order.dealer) {
      await Notification.create({
        recipient: order.dealer,
        recipientRole: "dealer",
        type: status,
        title: notifData.dealer.title,
        message: notifData.dealer.message,
        orderId: order._id,
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order updated to: ${phaseInfo?.label || status}`,
      order,
    });

  } catch (error) {
    console.error("[API] orders/[id]/status error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── Notification messages for each phase ─────────────────────────────────────
function getNotificationData(status: string, orderNumber: string) {
  const map: Record<string, {
    customer?: { title: string; message: string };
    dealer?: { title: string; message: string };
  }> = {
    dealer_accepted: {
      customer: {
        title: "Dealer Accepted Your Order! 🎉",
        message: `A verified dealer has accepted your retrofit inquiry ${orderNumber}. Verification will be scheduled shortly.`,
      },
    },
    verification_scheduled: {
      customer: {
        title: "Verification Scheduled 📅",
        message: `Your on-site verification for order ${orderNumber} has been scheduled. Please ensure your vehicle is ready.`,
      },
    },
    verification_passed: {
      customer: {
        title: "Verification Passed! ✅",
        message: `Great news! Your vehicle passed verification for order ${orderNumber}. Please proceed with the token payment.`,
      },
    },
    verification_failed: {
      customer: {
        title: "Verification Result ❌",
        message: `Unfortunately your vehicle did not pass verification for order ${orderNumber}. No payment has been charged. Our team will contact you shortly.`,
      },
    },
    token_paid: {
      dealer: {
        title: "Token Payment Received 💰",
        message: `Customer has paid the token amount for order ${orderNumber}. Please schedule vehicle pickup.`,
      },
    },
    pickup_scheduled: {
      customer: {
        title: "Pickup Scheduled 🚗",
        message: `Your vehicle pickup for order ${orderNumber} has been scheduled. Please keep your vehicle ready.`,
      },
    },
    vehicle_picked_up: {
      customer: {
        title: "Vehicle Picked Up 🔧",
        message: `Your vehicle for order ${orderNumber} has been picked up. Retrofit work will begin shortly.`,
      },
    },
    retrofit_in_progress: {
      customer: {
        title: "Retrofit In Progress ⚡",
        message: `Your vehicle is being retrofitted for order ${orderNumber}. We will notify you when complete.`,
      },
    },
    quality_check_done: {
      customer: {
        title: "Quality Check Passed 🛡️",
        message: `Your retrofitted vehicle passed quality check for order ${orderNumber}. RTO filing in progress.`,
      },
    },
    rto_filed: {
      customer: {
        title: "RTO & Form 22C Filed 📄",
        message: `All paperwork for order ${orderNumber} has been filed. Please proceed with final payment for delivery.`,
      },
    },
    delivered: {
      customer: {
        title: "Vehicle Delivered! 🎉",
        message: `Your EV retrofitted vehicle for order ${orderNumber} has been delivered. Welcome to the green revolution!`,
      },
      dealer: {
        title: "Order Completed ✅",
        message: `Order ${orderNumber} has been successfully delivered. Your commission will be processed shortly.`,
      },
    },
    cancelled: {
      customer: {
        title: "Order Cancelled",
        message: `Your order ${orderNumber} has been cancelled. If you paid a token, refund will be processed within 5-7 business days.`,
      },
      dealer: {
        title: "Order Cancelled",
        message: `Order ${orderNumber} has been cancelled by the customer.`,
      },
    },
  };

  return map[status] || {};
}