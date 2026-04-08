import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    const { orderId, paymentType } = await req.json();
    const order = await RetrofitOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Verify customer owns this order
    const userId = (session.user as { id?: string }).id;
    if (order.customer?.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    let amountInPaise: number;

    if (paymentType === "token") {
      if (order.payment.tokenPaid) {
        return NextResponse.json(
          { success: false, message: "Token already paid." },
          { status: 400 }
        );
      }
      if (order.status !== "verification_passed") {
        return NextResponse.json(
          { success: false, message: "Token payment only available after verification passes." },
          { status: 400 }
        );
      }
      // 30% of total
      const tokenAmount = Math.round(order.payment.totalAmount * 0.30);
      order.payment.tokenAmount = tokenAmount;
      await order.save();
      amountInPaise = tokenAmount * 100;
    } else {
      if (order.payment.finalPaid) {
        return NextResponse.json(
          { success: false, message: "Final payment already done." },
          { status: 400 }
        );
      }
      if (order.status !== "rto_filed") {
        return NextResponse.json(
          { success: false, message: "Final payment only available after RTO filing." },
          { status: 400 }
        );
      }
      const finalAmount = order.payment.totalAmount - order.payment.tokenAmount;
      order.payment.finalAmount = finalAmount;
      await order.save();
      amountInPaise = finalAmount * 100;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: "INR",
      receipt:  `${order.orderNumber}-${paymentType}`,
      notes: {
        orderId:     orderId,
        paymentType,
        orderNumber: order.orderNumber,
      },
    });

    return NextResponse.json({
      success:        true,
      razorpayOrderId: razorpayOrder.id,
      amount:          amountInPaise,
      currency:        "INR",
      orderNumber:     order.orderNumber,
    });

  } catch (error) {
    console.error("[API] payment/create-order error:", error);
    return NextResponse.json(
      { success: false, message: "Payment creation failed." },
      { status: 500 }
    );
  }
}