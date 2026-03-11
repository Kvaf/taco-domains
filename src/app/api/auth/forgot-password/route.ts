import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Generate token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });

      // Store hashed token with 1-hour expiry
      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token: hashedToken,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      console.log(
        `\n[DEV] Password reset link for ${normalizedEmail}: ${baseUrl}/reset-password?token=${rawToken}\n`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
