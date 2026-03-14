import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dealer from "@/models/Dealer";

// ── GET — Load dealer profile ──────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const email  = session.user.email;
    const dealer = await Dealer.findOne({ email });

    if (!dealer) {
      return NextResponse.json(
        { success: false, message: "Dealer profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, dealer });

  } catch (error) {
    console.error("[API] dealer/profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── POST — Update dealer profile ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { workshopPhotos, certifications, garageImages } = await req.json();

    const email  = session.user.email;
    const dealer = await Dealer.findOne({ email });

    if (!dealer) {
      return NextResponse.json(
        { success: false, message: "Dealer profile not found." },
        { status: 404 }
      );
    }

    // Update profile fields
    dealer.workshopPhotos = workshopPhotos || [];
    dealer.certifications = certifications || [];
    dealer.garageImages   = garageImages   || [];

    await dealer.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      dealer,
    });

  } catch (error) {
    console.error("[API] dealer/profile POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}