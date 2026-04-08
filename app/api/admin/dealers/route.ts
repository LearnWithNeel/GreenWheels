import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dealer from "@/models/Dealer";
import { sendDealerStatusEmail } from "@/lib/email";
import nodemailer from "nodemailer";
import Notification from "@/models/Notification";
import User from "@/models/User";

// ── Helper — send approval/rejection email ─────────────────────────────────
async function sendStatusEmail(
  email: string,
  name: string,
  status: "approved" | "rejected",
  reason?: string
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  const subject = status === "approved"
    ? "🎉 Your GreenWheels Dealer Profile is Approved!"
    : "❌ GreenWheels Dealer Profile — Action Required";

  const html = status === "approved"
    ? `
      <div style="font-family:Outfit,sans-serif;background:#052e16;
                  color:#86efac;padding:32px;border-radius:16px">
        <h2 style="color:#ffffff;font-size:24px">
          Welcome to GreenWheels, ${name}! 🌿
        </h2>
        <p style="color:#86efac">
          Your dealer profile has been <strong style="color:#a3e635">
          approved</strong> by our admin team.
        </p>
        <p style="color:#86efac">
          You are now visible to customers and will start receiving
          retrofit orders. Login to your dealer dashboard to manage
          your orders.
        </p>
        <a href="${process.env.NEXTAUTH_URL}/login"
          style="display:inline-block;background:#a3e635;color:#052e16;
                 padding:12px 24px;border-radius:12px;font-weight:900;
                 text-decoration:none;margin-top:16px">
          Go to Dashboard →
        </a>
      </div>
    `
    : `
      <div style="font-family:Outfit,sans-serif;background:#052e16;
                  color:#86efac;padding:32px;border-radius:16px">
        <h2 style="color:#ffffff;font-size:24px">
          Profile Update Required, ${name}
        </h2>
        <p style="color:#86efac">
          Your dealer profile was <strong style="color:#ef4444">
          not approved</strong> at this time.
        </p>
        ${reason ? `
          <div style="background:#1a1a1a;border:1px solid #991b1b;
                      border-radius:12px;padding:16px;margin:16px 0">
            <strong style="color:#ef4444">Reason:</strong>
            <p style="color:#fca5a5;margin:8px 0">${reason}</p>
          </div>
        ` : ""}
        <p style="color:#86efac">
          Please update your profile and resubmit for review.
        </p>
        <a href="${process.env.NEXTAUTH_URL}/dealer/profile"
          style="display:inline-block;background:#a3e635;color:#052e16;
                 padding:12px 24px;border-radius:12px;font-weight:900;
                 text-decoration:none;margin-top:16px">
          Update Profile →
        </a>
      </div>
    `;



  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    html,
  });
}


// ── GET — List dealers by status ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const query = status === "all" ? {} : { status };
    const dealers = await Dealer.find(query)
      .sort({ createdAt: -1 })
      .select("-password -otpCode -otpExpiry");

    return NextResponse.json({ success: true, dealers });

  } catch (error) {
    console.error("[API] admin/dealers GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ── POST — Approve or Reject dealer ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const { dealerId, action, rejectionReason } = await req.json();

    if (!dealerId || !action) {
      return NextResponse.json(
        { success: false, message: "Dealer ID and action are required." },
        { status: 400 }
      );
    }

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return NextResponse.json(
        { success: false, message: "Dealer not found." },
        { status: 404 }
      );
    }

    if (action === "approve") {
      dealer.status = "approved";
      dealer.approvedAt = new Date();
      dealer.rejectionReason = "";
      await dealer.save();

      // Notify all customers in same city
      const customersInCity = await User.find({
        "address.city": { $regex: dealer.garageAddress.city, $options: "i" },
        role: "customer",
      });

      for (const customer of customersInCity) {
        await Notification.create({
          recipient: customer._id,
          recipientRole: "customer",
          type: "new_dealer",
          title: "New Retrofit Dealer in Your Area! 🔧",
          message: `${dealer.garageName} is now a verified GreenWheels dealer in ${dealer.garageAddress.city}. Check them out for your EV retrofit!`,
          read: false,
        });
      }

      // After approve:
      await sendDealerStatusEmail({ to: dealer.email, name: dealer.name, status: "approved" });

      // Send approval email
      try {
        await sendStatusEmail(dealer.email, dealer.name, "approved");
      } catch (e) {
        console.error("[API] approval email failed:", e);
      }

      return NextResponse.json({
        success: true,
        message: `${dealer.name} has been approved successfully.`,
      });
    }

    if (action === "reject") {
      if (!rejectionReason?.trim()) {
        return NextResponse.json(
          { success: false, message: "Rejection reason is required." },
          { status: 400 }
        );
      }

      dealer.status = "rejected";
      dealer.rejectedAt = new Date();
      dealer.rejectionReason = rejectionReason;
      dealer.rejectionNote = rejectionReason;
      await dealer.save();

      // After reject:
      await sendDealerStatusEmail({ to: dealer.email, name: dealer.name, status: "rejected", reason: rejectionReason });

      // Send rejection email
      try {
        await sendStatusEmail(
          dealer.email,
          dealer.name,
          "rejected",
          rejectionReason
        );
      } catch (e) {
        console.error("[API] rejection email failed:", e);
      }

      return NextResponse.json({
        success: true,
        message: `${dealer.name} has been rejected.`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );

  } catch (error) {
    console.error("[API] admin/dealers POST error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}