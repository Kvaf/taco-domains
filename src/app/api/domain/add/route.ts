import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/domain/add — Manually add a domain you already own
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 }
      );
    }

    const domainName = name.trim().toLowerCase();

    // Basic validation
    const parts = domainName.split(".");
    if (parts.length < 2 || parts.some((p) => !p)) {
      return NextResponse.json(
        { error: "Invalid domain name. Use format: example.com" },
        { status: 400 }
      );
    }

    const tld = parts[parts.length - 1];

    // Check if already in our system
    const existing = await prisma.domain.findUnique({
      where: { name: domainName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Domain already exists in the system" },
        { status: 409 }
      );
    }

    // Create the domain with 1 year expiry from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const domain = await prisma.domain.create({
      data: {
        name: domainName,
        tld,
        userId: session.user.id,
        status: "ACTIVE",
        expiresAt,
        autoRenew: false,
        locked: false,
        whoisPrivacy: false,
      },
    });

    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error("Add domain error:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}
