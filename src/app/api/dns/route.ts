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
import * as cloudflare from "@/lib/cloudflare/client";

// GET /api/dns?domainId=xxx — List DNS records from Cloudflare
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

    // Get Zone ID from Cloudflare
    const zoneId = await cloudflare.getZoneId(domain.name);

    if (!zoneId) {
      // Fallback to database records if domain isn't on Cloudflare
      const records = await prisma.dNSRecord.findMany({
        where: { domainId },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });
      return NextResponse.json({
        records: records.map((r) => ({
          id: r.id,
          type: r.type,
          name: r.name,
          content: r.value,
          ttl: r.ttl,
          priority: r.priority,
        })),
        domain: { id: domain.id, name: domain.name, dnssec: domain.dnssec },
        source: "local",
      });
    }

    // Fetch live records from Cloudflare
    const cfRecords = await cloudflare.listRecords(zoneId);

    return NextResponse.json({
      records: cfRecords,
      domain: { id: domain.id, name: domain.name, dnssec: domain.dnssec },
      source: "cloudflare",
    });
  } catch (error) {
    console.error("DNS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/dns — Create a DNS record on Cloudflare
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

    const zoneId = await cloudflare.getZoneId(domain.name);

    if (zoneId) {
      // Create on Cloudflare
      const created = await cloudflare.createRecord(zoneId, {
        type: record.type,
        name: record.name === "@" ? domain.name : `${record.name}.${domain.name}`,
        content: record.value,
        ttl: record.ttl,
        priority: record.priority,
      });
      return NextResponse.json({ success: true, record: created, source: "cloudflare" });
    }

    // Fallback: save to database
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

    return NextResponse.json({ success: true, record: created, source: "local" });
  } catch (error) {
    console.error("DNS POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/dns — Update a DNS record on Cloudflare
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

    const { recordId, domainId, record } = validation.data;

    // We need the domain to look up the zone
    const did = domainId || (await prisma.dNSRecord.findUnique({
      where: { id: recordId },
      select: { domainId: true },
    }))?.domainId;

    if (!did) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const domain = await prisma.domain.findFirst({
      where: { id: did, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const zoneId = await cloudflare.getZoneId(domain.name);

    if (zoneId) {
      // Update on Cloudflare (recordId is the CF record ID)
      const updated = await cloudflare.updateRecord(zoneId, recordId, {
        type: record.type,
        name: record.name === "@" ? domain.name : `${record.name}.${domain.name}`,
        content: record.value,
        ttl: record.ttl,
        priority: record.priority,
      });
      return NextResponse.json({ success: true, record: updated, source: "cloudflare" });
    }

    // Fallback: update in database
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

    return NextResponse.json({ success: true, record: updated, source: "local" });
  } catch (error) {
    console.error("DNS PUT error:", error);
    const message = error instanceof Error ? error.message : "Failed to update record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/dns — Delete a DNS record from Cloudflare
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

    const { recordId, domainId } = validation.data;

    // Get domain for zone lookup
    const did = domainId || (await prisma.dNSRecord.findUnique({
      where: { id: recordId },
      select: { domainId: true },
    }))?.domainId;

    if (!did) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const domain = await prisma.domain.findFirst({
      where: { id: did, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const zoneId = await cloudflare.getZoneId(domain.name);

    if (zoneId) {
      // Delete from Cloudflare
      await cloudflare.deleteRecord(zoneId, recordId);
      return NextResponse.json({ success: true, source: "cloudflare" });
    }

    // Fallback: delete from database
    const existing = await prisma.dNSRecord.findUnique({
      where: { id: recordId },
      include: { domain: { select: { userId: true } } },
    });
    if (!existing || existing.domain.userId !== session.user.id) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.dNSRecord.delete({ where: { id: recordId } });
    return NextResponse.json({ success: true, source: "local" });
  } catch (error) {
    console.error("DNS DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete record";
    return NextResponse.json({ error: message }, { status: 500 });
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
