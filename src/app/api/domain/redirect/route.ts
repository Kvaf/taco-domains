import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { setRedirectSchema } from "@/lib/validators/domain-actions.schema";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = setRedirectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domainId, redirectUrl, redirectType } = validation.data;

    // Verify ownership
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, userId: session.user.id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const updated = await prisma.domain.update({
      where: { id: domainId },
      data: {
        redirectUrl,
        redirectType: redirectUrl ? redirectType : null,
      },
    });

    return NextResponse.json({ success: true, domain: updated });
  } catch (error) {
    console.error("Domain redirect error:", error);
    return NextResponse.json(
      { error: "Failed to update redirect" },
      { status: 500 }
    );
  }
}
