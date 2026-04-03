import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dealer from "@/models/Dealer";
import Vendor from "@/models/Vendor";
import RetrofitOrder from "@/models/RetrofitOrder";
import Complaint from "@/models/Complaint";

export async function GET() {
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

    const [
      totalCustomers,
      totalDealers,
      approvedDealers,
      pendingDealers,
      totalVendors,
      pendingVendors,
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalComplaints,
      openComplaints,
      escalatedComplaints,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Dealer.countDocuments({}),
      Dealer.countDocuments({ status: "approved" }),
      Dealer.countDocuments({ status: "pending" }),
      Vendor.countDocuments({}),
      Vendor.countDocuments({ status: "pending" }),
      RetrofitOrder.countDocuments({}),
      RetrofitOrder.countDocuments({
        status: { $nin: ["delivered","cancelled","verification_failed"] },
      }),
      RetrofitOrder.countDocuments({ status: "delivered" }),
      RetrofitOrder.countDocuments({
        status: { $in: ["cancelled","verification_failed"] },
      }),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "escalated" }),
    ]);

    // Recent orders
    const recentOrders = await RetrofitOrder.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email");

    return NextResponse.json({
      success: true,
      stats: {
        customers: { total: totalCustomers },
        dealers:   {
          total: totalDealers,
          approved: approvedDealers,
          pending:  pendingDealers,
        },
        vendors:   { total: totalVendors, pending: pendingVendors },
        orders:    {
          total:     totalOrders,
          active:    activeOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        complaints: {
          total:     totalComplaints,
          open:      openComplaints,
          escalated: escalatedComplaints,
        },
      },
      recentOrders,
    });

  } catch (error) {
    console.error("[API] admin/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}