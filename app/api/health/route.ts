import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      status:    "ok",
      message:   "GreenWheels API is running",
      database:  "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status:   "error",
        message:  "Database connection failed",
        error:    message,
        tip:      "Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0",
      },
      { status: 500 }
    );
  }
}