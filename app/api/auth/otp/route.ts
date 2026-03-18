import { NextRequest, NextResponse } from "next/server";
import {
  verifyCustomerOTP,
  sendCustomerOTP,
  sendDealerOTP,
  verifyDealerOTP,
  sendAdminOTP,
  verifyAdminOTP,
  sendVendorOTP,
  verifyVendorOTP,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { action, email, otp, role } = await req.json();

    // ── action: "send" ────────────────────────────────────────────────────────
    if (action === "send") {
      if (role === "admin") {
        const result = await sendAdminOTP();
        return NextResponse.json(result);
      }

      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 }
        );
      }

      // ── Dealer OTP ──
      if (role === "dealer") {
        const result = await sendDealerOTP(email, "login");
        return NextResponse.json(result);
      }

      // ── Vendor OTP ──
      if (role === "vendor") {
        const result = await sendVendorOTP(email, "login");
        return NextResponse.json(result);
      }


      // ── Customer OTP ──
      const result = await sendCustomerOTP(email, "login");
      return NextResponse.json(result);
    }

    // ── action: "verify" ──────────────────────────────────────────────────────
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

      // ── Dealer OTP verify ──
      if (role === "dealer") {
        const result = await verifyDealerOTP(email, otp);
        return NextResponse.json(result);
      }

      // ── Vendor OTP verify ──
      if (role === "vendor") {
        const result = await verifyVendorOTP(email, otp);
        return NextResponse.json(result);
      }

      // ── Customer OTP verify ──
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
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}