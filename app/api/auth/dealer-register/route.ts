import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Dealer from "@/models/Dealer";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP, getOTPExpiry } from "@/lib/otp";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const {
            name, email, password, phone,
            garageName, govtLicenseNo, govtIdType,
            govtLicenseDoc, profileImage,
            garageAddress, specialization,
            experience, certifications,
            araiKitBrands, erfcCertified, erfcCertNo,
        } = await req.json();

        // ── Validate required fields ──
        if (!name || !email || !password || !phone ||
            !garageName || !govtLicenseNo || !govtIdType ||
            !govtLicenseDoc || !garageAddress?.street ||
            !garageAddress?.city || !garageAddress?.state ||
            !garageAddress?.pincode) {
            return NextResponse.json(
                { success: false, message: "All required fields must be filled." },
                { status: 400 }
            );
        }

        if (specialization?.length === 0) {
            return NextResponse.json(
                { success: false, message: "Select at least one specialization." },
                { status: 400 }
            );
        }

        // ── Check duplicate email ──
        const existing = await Dealer.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "A dealer account with this email already exists." },
                { status: 409 }
            );
        }

        // ── Generate OTP ──
        const otp = generateOTP();
        const expiry = getOTPExpiry();

        // ── Create dealer ──
        await Dealer.create({
            name,
            email,
            password,
            phone,
            garageName,
            govtLicenseNo,
            govtIdType,
            govtLicenseDoc,
            profileImage: profileImage || "",
            garageAddress,
            specialization: specialization || [],
            experience: experience || 0,
            certifications: certifications || [],
            araiKitBrands: araiKitBrands || [],
            erfcCertified: erfcCertified || false,
            erfcCertNo: erfcCertNo || "",
            emailVerified: false,
            otpCode: otp,
            otpExpiry: expiry,
            status: "pending",
        });

        // ── Send OTP email ──
        await sendOTPEmail({
            to: email,
            name,
            otp,
            purpose: "register",
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful! Please verify your email.",
        });

    } catch (error: unknown) {
        console.error("[API] dealer-register error:", error);

        // Handle duplicate key error
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: number }).code === 11000
        ) {
            return NextResponse.json(
                { success: false, message: "Email already registered." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}