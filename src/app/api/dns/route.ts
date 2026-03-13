import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  createDnsRecordSchema,
  updateDnsRecordSchema,
  deleteDnsRecordSchema,
  toggleDnssecSchema,
} from "@/lib/validators/dns.schema";
import { checkFeature } from "@/lib/settings/feature-gate";

// GET /api/dns?domainId=xxx — List DNS records for a domain
export async function GET(req: NextRequest) {
  try {
    const gate = await checkFeature("dnsManagement");
    if (gate) return gate;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domainId = req.nextUrl.searchParams.get("domainId");
    if (!domainId) {
      return NextResponse.json({ error: "domainId required" }, { status: 400 });
    }

    // Verify ownership
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const records = await prisma.dNSRecord.findMany({
      where: { domainId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ records, domain: { id: domain.id, name: domain.name, dnssec: domain.dnssec } });
  } catch (error) {
    console.error("DNS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/dns — Create a DNS record
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createDnsRecordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domainId, record } = validation.data;

    // Verify ownership
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const created = await prisma.dNSRecord.create({
      data: {
        domainId,
        type: record.type,
        name: record.name,
        value: record.value,
        ttl: record.ttl,
        priority: record.priority,
      },
    });

    return NextResponse.json({ success: true, record: created });
  } catch (error) {
    console.error("DNS POST error:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

// PUT /api/dns — Update a DNS record
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateDnsRecordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { recordId, record } = validation.data;

    // Verify ownership through record → domain → user
    const existing = await prisma.dNSRecord.findUnique({
      where: { id: recordId },
      include: { domain: { select: { userId: true } } },
    });
    if (!existing || existing.domain.userId !== session.user.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await prisma.dNSRecord.update({
      where: { id: recordId },
      data: {
        type: record.type,
        name: record.name,
        value: record.value,
        ttl: record.ttl,
        priority: record.priority,
      },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error("DNS PUT error:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// DELETE /api/dns — Delete a DNS record
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = deleteDnsRecordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { recordId } = validation.data;

    // Verify ownership
    const existing = await prisma.dNSRecord.findUnique({
      where: { id: recordId },
      include: { domain: { select: { userId: true } } },
    });
    if (!existing || existing.domain.userId !== session.user.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.dNSRecord.delete({ where: { id: recordId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DNS DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

// PATCH /api/dns — Toggle DNSSEC
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = toggleDnssecSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domainId, enabled } = validation.data;

    const domain = await prisma.domain.findFirst({
      where: { id: domainId, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    await prisma.domain.update({
      where: { id: domainId },
      data: { dnssec: enabled },
    });

    return NextResponse.json({ success: true, dnssec: enabled });
  } catch (error) {
    console.error("DNSSEC toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle DNSSEC" }, { status: 500 });
  }
}
