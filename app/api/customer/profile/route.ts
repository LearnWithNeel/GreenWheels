import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// ── GET — load customer profile ────────────────────────────────────────────
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

        const user = await User.findById(
            (session.user as { id?: string }).id
        ).select("-password -otpCode -otpExpiry");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("[API] customer/profile GET error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}

// ── POST — update customer profile ────────────────────────────────────────
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

        const { name, phone, address, city, state, pincode } = await req.json();

        const user = await User.findById(
            (session.user as { id?: string }).id
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            );
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        user.address = {
            street: address || user.address?.street || "",
            city: city || user.address?.city || "",
            state: state || user.address?.state || "",
            pincode: pincode || user.address?.pincode || "",
        };

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully.",
            user,
        });

    } catch (error) {
        console.error("[API] customer/profile POST error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}