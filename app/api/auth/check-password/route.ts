import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dealer from "@/models/Dealer";

export async function POST(req: NextRequest) {
    try {
        const { email, password, isAdmin } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required." },
                { status: 400 }
            );
        }

        // ── Admin check — against .env only, no DB needed ──
        if (isAdmin) {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (email !== adminEmail || password !== adminPassword) {
                return NextResponse.json(
                    { success: false, message: "Invalid admin credentials." },
                    { status: 401 }
                );
            }
            return NextResponse.json({ success: true });
        }

        // ── Customer check — against DB ──
        // ── Customer check — against DB ──
        await connectDB();

        // Check customer first
        const user = await User.findOne({ email }).select("+password");
        if (user && user.password) {
            const valid = await user.comparePassword(password);
            if (!valid) {
                return NextResponse.json(
                    { success: false, message: "Incorrect password." },
                    { status: 401 }
                );
            }
            return NextResponse.json({ success: true, role: "customer" });
        }

        // Check dealer
        const dealer = await Dealer.findOne({ email }).select("+password");
        if (dealer && dealer.password) {
            const valid = await dealer.comparePassword(password);
            if (!valid) {
                return NextResponse.json(
                    { success: false, message: "Incorrect password." },
                    { status: 401 }
                );
            }
            return NextResponse.json({ success: true, role: "dealer" });
        }

        return NextResponse.json(
            { success: false, message: "No account found with this email." },
            { status: 404 }
        );

    } catch (error) {
        console.error("[API] check-password error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong." },
            { status: 500 }
        );
    }
}