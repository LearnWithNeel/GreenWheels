import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Dealer from "@/models/Dealer";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "dealer";

    if (type === "dealer") {
      const dealers = await Dealer.find({ status: "approved" })
        .select("name garageName garageAddress.city _id")
        .sort({ garageName: 1 });

      return NextResponse.json({ success: true, parties: dealers });
    }

    return NextResponse.json({ success: true, parties: [] });

  } catch (error) {
    console.error("[API] complaints/parties error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}