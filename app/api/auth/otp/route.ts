import { NextRequest, NextResponse } from "next/server";
import {
  verifyCustomerOTP,
  sendCustomerOTP,
  sendAdminOTP,
  verifyAdminOTP,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { action, email, otp, role } = await req.json();

    // ── action: "send" — resend OTP ──────────────────────────────────────────
    if (action === "send") {
      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 }
        );
      }

      if (role === "admin") {
        const result = await sendAdminOTP();
        return NextResponse.json(result);
      }

      const result = await sendCustomerOTP(email, "login");
      return NextResponse.json(result);
    }

    // ── action: "verify" — verify OTP ────────────────────────────────────────
    if (action === "verify") {
      if (!otp) {
        return NextResponse.json(
          { success: false, message: "OTP is required." },
          { status: 400 }
        );
      }

      if (role === "admin") {
        const result = await verifyAdminOTP(otp);
        return NextResponse.json(result);
      }

      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 }
        );
      }

      const result = await verifyCustomerOTP(email, otp);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );

  } catch (error) {
    console.error("[API] /otp error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}