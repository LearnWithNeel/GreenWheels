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
      .populate("customer", "name email phone address")
      .populate("dealer",   "name garageName garageAddress phone");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    if (!order.payment.finalPaid) {
      return NextResponse.json(
        { success: false, message: "Invoice only available after final payment." },
        { status: 400 }
      );
    }

    // Return order data — client generates PDF
    return NextResponse.json({
      success: true,
      invoice: {
        orderNumber:  order.orderNumber,
        date:         order.updatedAt,
        customer:     order.customer,
        dealer:       order.dealer,
        vehicle: {
          brand:              order.vehicle.brand,
          model:              order.vehicle.model,
          year:               order.vehicle.year,
          registrationNumber: order.vehicle.registrationNumber,
          fuelType:           order.vehicle.fuelType,
        },
        retrofit: {
          type:            order.retrofit.type,
          motorPower:      order.retrofit.motorPower,
          batteryCapacity: order.retrofit.batteryCapacity,
        },
        payment: {
          totalAmount: order.payment.totalAmount,
          tokenAmount: order.payment.tokenAmount,
          finalAmount: order.payment.finalAmount,
          tokenPaid:   order.payment.tokenPaid,
          finalPaid:   order.payment.finalPaid,
        },
      },
    });

  } catch (error) {
    console.error("[API] invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}