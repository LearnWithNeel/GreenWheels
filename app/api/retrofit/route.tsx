import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import RetrofitOrder from "@/models/RetrofitOrder";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Please login to submit an inquiry." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const {
      vehicleType, brand, model, year,
      registrationNumber, color, fuelType, kmDriven,
      photoFront, photoBack, photoLeft, photoRight,
      rcDocument, ownerName, ownerAddress,
      retrofitType, motorPower,
      batteryCapacity, expectedRange, chargingType,
      specialRequests,
    } = body;

    const blockedStatuses = [
      "inquiry_submitted",
      "dealer_accepted",
      "verification_scheduled",
      "verification_ongoing",
      "verification_passed",
      "token_paid",
      "pickup_scheduled",
      "vehicle_picked_up",
      "retrofit_in_progress",
      "quality_check_done",
      "rto_filed",
      "delivered",
    ];

    // ── Registration number uniqueness check ──────────────────────────────────
    const regNumber = (registrationNumber || "").toUpperCase().trim();

    const existingOrder = await RetrofitOrder.findOne({
      "vehicle.registrationNumber": regNumber,
      status: { $in: blockedStatuses },
    });

    if (existingOrder) {
      const isCompleted = existingOrder.status === "delivered";
      return NextResponse.json(
        {
          success: false,
          message: isCompleted
            ? `Vehicle ${regNumber} has already been converted to electric (Order ${existingOrder.orderNumber}). A vehicle cannot be retrofitted twice as per RTO regulations.`
            : `Vehicle ${regNumber} already has an active retrofit order in progress (Order ${existingOrder.orderNumber}). Please complete or cancel the existing order before placing a new one.`,
        },
        { status: 409 }
      );
    }



    // ── Validate required fields ──
    if (
      !vehicleType || !brand || !model || !year ||
      !registrationNumber || !color || !fuelType || !kmDriven ||
      !photoFront || !photoBack || !photoLeft || !photoRight ||
      !rcDocument || !ownerName || !ownerAddress ||
      !retrofitType || !motorPower ||
      !batteryCapacity || !expectedRange || !chargingType
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // ── Get user ID from session ──
    const userId = (session.user as { id?: string }).id;

    // ── Generate order number GW-YYYYMMDD-XXXX ──
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await RetrofitOrder.countDocuments() + 1;
    const orderNumber = `GW-${datePart}-${String(count).padStart(4, "0")}`;

    // ── Create order ──
    const order = await RetrofitOrder.create({
      orderNumber,
      customer: userId,
      status: "inquiry_submitted",

      vehicle: {
        type: vehicleType,
        brand,
        model,
        year: parseInt(year),
        registrationNumber,
        color,
        fuelType,
        kmDriven: parseInt(kmDriven),
        photos: {
          front: photoFront,
          back: photoBack,
          left: photoLeft,
          right: photoRight,
        },
      },

      ownership: {
        ownerName,
        ownerAddress,
        rcDocument,
      },

      retrofit: {
        type: retrofitType,
        motorPower,
        batteryCapacity,
        expectedRange,
        chargingType,
        specialRequests: specialRequests || "",
      },

      payment: {
        totalAmount: 0,
        tokenAmount: 0,
        finalAmount: 0,
        tokenPaid: false,
        finalPaid: false,
      },

      history: [{
        status: "inquiry_submitted",
        note: "Retrofit inquiry submitted by customer.",
        updatedAt: new Date(),
      }],
    });

    // Notify customer — order placed
    await Notification.create({
      recipient: userId,
      recipientRole: "customer",
      type: "order_placed",
      title: "Order Placed Successfully! 📋",
      message: `Your retrofit inquiry ${orderNumber} has been submitted. Our verified dealers have been notified. You will hear back shortly.`,
      orderId: order._id,
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: "Retrofit inquiry submitted successfully!",
      orderId: order._id.toString(),
      orderNumber,
    });

  } catch (error) {
    console.error("[API] /retrofit error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}