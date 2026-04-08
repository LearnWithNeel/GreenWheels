import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Notification from "@/models/Notification";
import crypto from "crypto";

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      paymentType,
    } = await req.json();

    // Verify signature
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed." },
        { status: 400 }
      );
    }

    const order = await RetrofitOrder.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    if (paymentType === "token") {
      order.payment.tokenPaid = true;
      order.status            = "token_paid";
      order.history.push({
        status:    "token_paid",
        note:      `Token payment of ₹${order.payment.tokenAmount.toLocaleString()} received.`,
        updatedAt: new Date(),
      });

      // Notify dealer
      if (order.dealer) {
        await Notification.create({
          recipient:     order.dealer,
          recipientRole: "dealer",
          type:          "token_paid",
          title:         "Token Payment Received 💰",
          message:       `Customer has paid the token amount for order ${order.orderNumber}. Please schedule vehicle pickup.`,
          orderId:       order._id,
          read:          false,
        });
      }
    } else {
      order.payment.finalPaid = true;
      order.status            = "delivered";
      order.history.push({
        status:    "delivered",
        note:      `Final payment of ₹${order.payment.finalAmount.toLocaleString()} received. Order complete.`,
        updatedAt: new Date(),
      });

      // Notify customer
      await Notification.create({
        recipient:     order.customer,
        recipientRole: "customer",
        type:          "delivered",
        title:         "Payment Complete — Order Delivered! 🎉",
        message:       `Your EV conversion for order ${order.orderNumber} is complete. Your invoice is ready for download.`,
        orderId:       order._id,
        read:          false,
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: paymentType === "token"
        ? "Token payment successful!"
        : "Final payment successful! Your vehicle retrofit is complete.",
      paymentType,
    });

  } catch (error) {
    console.error("[API] payment/verify error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed." },
      { status: 500 }
    );
  }
}