import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SupportUser from "@/models/SupportUser";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required." },
        { status: 400 }
      );
    }

    // Find support user
    const user = await SupportUser.findOne({ email })
      .select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated. Contact admin." },
        { status: 403 }
      );
    }

    // Verify password
    const valid = await user.comparePassword(password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = sign(
      {
        id:    user._id.toString(),
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "12h" }
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id:   user._id,
        name: user.name,
        email: user.email,
        role:  user.role,
      },
    });

    response.cookies.set("support-token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   12 * 60 * 60, // 12 hours
      path:     "/",
    });

    return response;

  } catch (error) {
    console.error("[API] support/auth error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set("support-token", "", {
    httpOnly: true,
    maxAge:   0,
    path:     "/",
  });

  return response;
}