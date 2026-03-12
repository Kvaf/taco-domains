import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domains = await prisma.domain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { dnsRecords: true },
        },
      },
    });

    // Calculate stats
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const total = domains.length;
    const active = domains.filter((d) => d.status === "ACTIVE").length;
    const expiringSoon = domains.filter(
      (d) => d.status === "ACTIVE" && d.expiresAt <= thirtyDaysFromNow
    ).length;

    return NextResponse.json({
      domains,
      stats: { total, active, expiringSoon },
    });
  } catch (error) {
    console.error("Domain list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
