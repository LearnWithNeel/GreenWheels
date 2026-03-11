import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "No account found with this email." },
        { status: 404 }
      );
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API] check-password error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}