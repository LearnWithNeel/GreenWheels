import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId  = (session?.user as { id?: string })?.id;
    const role    = (session?.user as { role?: string })?.role;

    await connectDB();

    if (role === "vendor") {
      const products = await Product.find({ vendor: userId })
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, products });
    }

    // Public — only approved products
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const query: Record<string, unknown> = { isApproved: true, isActive: true };
    if (category !== "all") query.category = category;

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });

  } catch (error) {
    console.error("[API] vendor/products GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId  = (session?.user as { id?: string })?.id;
    const role    = (session?.user as { role?: string })?.role;

    if (role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can add products." },
        { status: 403 }
      );
    }

    await connectDB();

    const vendor = await Vendor.findById(userId);
    if (!vendor || vendor.status !== "approved") {
      return NextResponse.json(
        { success: false, message: "Your vendor account must be approved before listing products." },
        { status: 403 }
      );
    }

    const {
      name, brand, category, vehicle,
      price, mrp, stock, images,
      description, specs,
      araiApproved, araiCertNo,
      bisApproved, bisCertNo,
      hsnCode, warranty, countryOfOrigin,
    } = await req.json();

    if (!name || !brand || !category || !price || !mrp || !description) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    const product = await Product.create({
      vendor:     userId,
      vendorName: vendor.businessName,
      name, brand, category,
      vehicle:    vehicle || [],
      price, mrp,
      stock:      stock || 0,
      images:     images || [],
      description,
      specs:      specs || [],
      araiApproved: araiApproved || false,
      araiCertNo:   araiCertNo  || "",
      bisApproved:  bisApproved || false,
      bisCertNo:    bisCertNo   || "",
      hsnCode:      hsnCode     || "",
      warranty:     warranty    || "",
      countryOfOrigin: countryOfOrigin || "India",
      isActive:   true,
      isApproved: false,
    });

    // Update vendor product count
    await Vendor.findByIdAndUpdate(userId, {
      $inc: { totalProducts: 1 }
    });

    return NextResponse.json({
      success: true,
      message: "Product submitted for admin review.",
      product,
    });

  } catch (error) {
    console.error("[API] vendor/products POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}