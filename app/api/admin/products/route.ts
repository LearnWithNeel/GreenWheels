import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "pending";

    const query = filter === "pending"
      ? { isApproved: false, isActive: true }
      : filter === "approved"
      ? { isApproved: true }
      : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });

  } catch (error) {
    console.error("[API] admin/products GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role    = (session?.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { productId, action, rejectionReason } = await req.json();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    if (action === "approve") {
      product.isApproved = true;
    } else if (action === "reject") {
      product.isActive        = false;
      product.rejectionReason = rejectionReason || "";
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Product ${action}d.`,
    });

  } catch (error) {
    console.error("[API] admin/products POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}