import crypto from "crypto";
import { sendOTPEmail } from "./email";
import connectDB from "./db";
import User from "@/models/User";
import Dealer from "@/models/Dealer";
import Vendor from "@/models/Vendor";

// ─── Generate a 6-digit OTP ───────────────────────────────────────────────────
export function generateOTP(): string {
  // crypto.randomInt is cryptographically secure
  return crypto.randomInt(100000, 999999).toString();
}

// ─── OTP expiry — 10 minutes from now ────────────────────────────────────────
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 2);
  return expiry;
}

// ─── Send OTP to Customer (User model) ───────────────────────────────────────
export async function sendCustomerOTP(
  email: string,
  purpose: "register" | "login"
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "No account found with this email." };
    }

    const otp    = generateOTP();
    const expiry = getOTPExpiry();

    // Save OTP to DB — select:false fields need direct update
    await User.updateOne(
      { email },
      { otpCode: otp, otpExpiry: expiry }
    );

    const sent = await sendOTPEmail({
      to:      email,
      name:    user.name,
      otp,
      purpose,
    });

    if (!sent) {
      return { success: false, message: "Failed to send OTP email. Try again." };
    }

    return { success: true, message: "OTP sent to your email." };
  } catch (error) {
    console.error("[GW-OTP] sendCustomerOTP error:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}

// ─── Send OTP to Dealer ───────────────────────────────────────────────────────
export async function sendDealerOTP(
  email: string,
  purpose: "register" | "login"
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();

    const dealer = await Dealer.findOne({ email });

    if (!dealer) {
      return { success: false, message: "No dealer account found with this email." };
    }

    const otp    = generateOTP();
    const expiry = getOTPExpiry();

    await Dealer.updateOne(
      { email },
      { otpCode: otp, otpExpiry: expiry }
    );

    const sent = await sendOTPEmail({
      to:      email,
      name:    dealer.name,
      otp,
      purpose,
    });

    if (!sent) {
      return { success: false, message: "Failed to send OTP email. Try again." };
    }

    return { success: true, message: "OTP sent to your email." };
  } catch (error) {
    console.error("[GW-OTP] sendDealerOTP error:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}

// ─── Verify OTP for Customer ──────────────────────────────────────────────────
export async function verifyCustomerOTP(
  email: string,
  otp:   string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();

    // Must use +otpCode +otpExpiry to get select:false fields
    const user = await User.findOne({ email }).select("+otpCode +otpExpiry");

    if (!user) {
      return { success: false, message: "No account found." };
    }

    if (!user.otpCode || !user.otpExpiry) {
      return { success: false, message: "No OTP requested. Please request a new one." };
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    // Check match
    if (user.otpCode !== otp) {
      return { success: false, message: "Incorrect OTP. Please try again." };
    }

    // OTP valid — clear it and mark email verified
    await User.updateOne(
      { email },
      { otpCode: null, otpExpiry: null, emailVerified: true }
    );

    return { success: true, message: "OTP verified successfully." };
  } catch (error) {
    console.error("[GW-OTP] verifyCustomerOTP error:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}

// ─── Verify OTP for Dealer ────────────────────────────────────────────────────
export async function verifyDealerOTP(
  email: string,
  otp:   string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();

    const dealer = await Dealer.findOne({ email }).select("+otpCode +otpExpiry");

    if (!dealer) {
      return { success: false, message: "No dealer account found." };
    }

    if (!dealer.otpCode || !dealer.otpExpiry) {
      return { success: false, message: "No OTP requested. Please request a new one." };
    }

    if (new Date() > dealer.otpExpiry) {
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    if (dealer.otpCode !== otp) {
      return { success: false, message: "Incorrect OTP. Please try again." };
    }

    await Dealer.updateOne(
      { email },
      { otpCode: null, otpExpiry: null, emailVerified: true }
    );

    return { success: true, message: "OTP verified successfully." };
  } catch (error) {
    console.error("[GW-OTP] verifyDealerOTP error:", error);
    return { success: false, message: "Something went wrong. Try again." };
  }
}

// ─── Send Admin OTP (no DB — uses env credentials) ───────────────────────────
export async function sendAdminOTP(): Promise<{
  success: boolean;
  message: string;
  otp?:    string;
}> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL!;
    const otp        = generateOTP();
    const expiry     = getOTPExpiry();

    // Store in memory for this process — admin is single user
    global._adminOTP = { otp, expiry };

    const sent = await sendOTPEmail({
      to:      adminEmail,
      name:    "Admin",
      otp,
      purpose: "admin-login",
    });

    if (!sent) {
      return { success: false, message: "Failed to send admin OTP." };
    }

    return { success: true, message: "OTP sent to admin email." };
  } catch (error) {
    console.error("[GW-OTP] sendAdminOTP error:", error);
    return { success: false, message: "Something went wrong." };
  }
}

// ─── Verify Admin OTP ─────────────────────────────────────────────────────────
export async function verifyAdminOTP(
  otp: string
): Promise<{ success: boolean; message: string }> {
  const stored = global._adminOTP;

  if (!stored) {
    return { success: false, message: "No OTP requested. Please try again." };
  }

  if (new Date() > stored.expiry) {
    global._adminOTP = undefined;
    return { success: false, message: "OTP has expired. Please try again." };
  }

  if (stored.otp !== otp) {
    return { success: false, message: "Incorrect OTP." };
  }

  global._adminOTP = undefined;
  return { success: true, message: "Admin OTP verified." };
}

// ─── Send OTP to Vendor ───────────────────────────────────────────────────────
export async function sendVendorOTP(
  email: string,
  purpose: "register" | "login"
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return { success: false, message: "No vendor account found." };
    const otp    = generateOTP();
    const expiry = getOTPExpiry();
    await Vendor.updateOne({ email }, { otpCode: otp, otpExpiry: expiry });
    const sent = await sendOTPEmail({ to: email, name: vendor.name, otp, purpose });
    if (!sent) return { success: false, message: "Failed to send OTP." };
    return { success: true, message: "OTP sent." };
  } catch (error) {
    console.error("[GW-OTP] sendVendorOTP error:", error);
    return { success: false, message: "Something went wrong." };
  }
}

// ─── Verify OTP for Vendor ────────────────────────────────────────────────────
export async function verifyVendorOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ email }).select("+otpCode +otpExpiry");
    if (!vendor) return { success: false, message: "No vendor account found." };
    if (!vendor.otpCode || !vendor.otpExpiry) return { success: false, message: "No OTP requested." };
    if (new Date() > vendor.otpExpiry) return { success: false, message: "OTP expired." };
    if (vendor.otpCode !== otp) return { success: false, message: "Incorrect OTP." };
    await Vendor.updateOne({ email }, { otpCode: null, otpExpiry: null, emailVerified: true });
    return { success: true, message: "OTP verified." };
  } catch (error) {
    console.error("[GW-OTP] verifyVendorOTP error:", error);
    return { success: false, message: "Something went wrong." };
  }
}