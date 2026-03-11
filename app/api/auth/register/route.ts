import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // ── Basic validation ──
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Check if email already exists ──
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Generate OTP ──
    const otp    = generateOTP();
    const expiry = getOTPExpiry();

    // ── Create user — emailVerified: false until OTP confirmed ──
    await User.create({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      password,
      role:          "customer",
      emailVerified: false,
      otpCode:       otp,
      otpExpiry:     expiry,
    });

    // ── Send OTP email ──
    const sent = await sendOTPEmail({
      to:      email,
      name:    name.trim(),
      otp,
      purpose: "register",
    });

    if (!sent) {
      // Delete the user we just created so they can retry
      await User.deleteOne({ email });
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created. OTP sent to your email — verify to continue.",
      email,
    });

  } catch (error) {
    console.error("[API] /register error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}