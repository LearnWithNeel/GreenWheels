import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("support-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const user = verify(
      token,
      process.env.NEXTAUTH_SECRET || "secret"
    ) as { id: string; name: string; email: string; role: string };

    return NextResponse.json({ success: true, user });

  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token." },
      { status: 401 }
    );
  }
}