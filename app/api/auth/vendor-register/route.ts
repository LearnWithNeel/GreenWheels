import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { sendWelcomeEmail, sendOTPEmail } from "@/lib/email";
import { generateOTP, getOTPExpiry } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      name, email, password, phone,
      businessName, businessType,
      gstNumber, gstDocument,
      tradeLicense, tradeLicenseDoc,
      araiApproval, araiApprovalDoc,
      productCategories,
      bankAccountName, bankAccountNumber, bankIfsc,
      address, agreedToTerms,
    } = await req.json();

    if (!name || !email || !password || !phone ||
      !businessName || !businessType || !gstNumber ||
      !gstDocument || !address?.street || !address?.city ||
      !address?.state || !address?.pincode) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { success: false, message: "You must agree to GreenWheels Vendor Terms." },
        { status: 400 }
      );
    }

    const existing = await Vendor.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A vendor account with this email already exists." },
        { status: 409 }
      );
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();

    await Vendor.create({
      name, email, password, phone,
      businessName, businessType,
      gstNumber, gstDocument,
      tradeLicense: tradeLicense || "",
      tradeLicenseDoc: tradeLicenseDoc || "",
      araiApproval: araiApproval || "",
      araiApprovalDoc: araiApprovalDoc || "",
      productCategories: productCategories || [],
      bankAccountName: bankAccountName || "",
      bankAccountNumber: bankAccountNumber || "",
      bankIfsc: bankIfsc || "",
      address,
      agreedToTerms,
      emailVerified: false,
      otpCode: otp,
      otpExpiry: expiry,
      status: "pending",
    });

    // After vendor created:
    await sendWelcomeEmail({ to: email, name, role: "vendor" });
    
    await sendOTPEmail({
      to: email,
      name,
      otp,
      purpose: "register",
    });


    return NextResponse.json({
      success: true,
      message: "Registration successful! Please verify your email.",
    });

  } catch (error: unknown) {
    console.error("[API] vendor-register error:", error);
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}