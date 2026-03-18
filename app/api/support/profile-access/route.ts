import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dealer from "@/models/Dealer";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { verify } from "jsonwebtoken";

// ── Helper: verify support token ──────────────────────────────────────────
function verifySupportToken(req: NextRequest) {
  try {
    const token = req.cookies.get("support-token")?.value;
    if (!token) return null;
    return verify(token, process.env.NEXTAUTH_SECRET || "secret") as {
      id: string; role: string; email: string; name: string;
    };
  } catch { return null; }
}

// ── POST — request OTP for profile access ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const support = verifySupportToken(req);
    if (!support) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { targetEmail, targetRole, action } = await req.json();

    if (!targetEmail || !targetRole) {
      return NextResponse.json(
        { success: false, message: "Email and role required." },
        { status: 400 }
      );
    }

    // ── Send OTP ──
    if (action === "request") {
      const otp    = generateOTP();
      const expiry = getOTPExpiry();

      let user = null;
      let name = "";

      if (targetRole === "customer") {
        user = await User.findOne({ email: targetEmail });
        if (user) {
          user.otpCode   = otp;
          user.otpExpiry = expiry;
          await user.save();
          name = user.name;
        }
      } else if (targetRole === "dealer") {
        user = await Dealer.findOne({ email: targetEmail });
        if (user) {
          user.otpCode   = otp;
          user.otpExpiry = expiry;
          await user.save();
          name = user.name;
        }
      }

      if (!user) {
        return NextResponse.json(
          { success: false, message: `No ${targetRole} found with this email.` },
          { status: 404 }
        );
      }

      // Send OTP email
      await sendOTPEmail({
        to:      targetEmail,
        name,
        otp,
        purpose: "support_access",
      });

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${targetEmail}. Ask them to share it with you.`,
        userName: name,
      });
    }

    // ── Verify OTP + return profile ──
    if (action === "verify") {
      const { otp } = await req.json();

      let user = null;

      if (targetRole === "customer") {
        user = await User.findOne({ email: targetEmail })
          .select("-password");
      } else if (targetRole === "dealer") {
        user = await Dealer.findOne({ email: targetEmail })
          .select("-password");
      }

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }

      // Check OTP
      const fullUser = targetRole === "customer"
        ? await User.findOne({ email: targetEmail }).select("+otpCode +otpExpiry")
        : await Dealer.findOne({ email: targetEmail }).select("+otpCode +otpExpiry");

      if (!fullUser?.otpCode || fullUser.otpCode !== otp) {
        return NextResponse.json(
          { success: false, message: "Invalid OTP." },
          { status: 400 }
        );
      }

      if (fullUser.otpExpiry && new Date() > fullUser.otpExpiry) {
        return NextResponse.json(
          { success: false, message: "OTP has expired." },
          { status: 400 }
        );
      }

      // Clear OTP after use
      fullUser.otpCode   = undefined;
      fullUser.otpExpiry = undefined;
      await fullUser.save();

      return NextResponse.json({
        success: true,
        message: "Profile access granted for 15 minutes.",
        profile: user,
        role:    targetRole,
        accessExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );

  } catch (error) {
    console.error("[API] support/profile-access error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}