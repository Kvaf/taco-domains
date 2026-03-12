import { PrismaClient } from "@prisma/client";
import type {
  RegistrarAdapter,
  AvailabilityResult,
  RegisterOpts,
  DomainResult,
  DNSRecordInput,
  DNSRecordOutput,
} from "./registrar.adapter";

/**
 * SimulatedRegistrar - database-backed implementation of RegistrarAdapter
 *
 * All domain operations are simulated via the database.
 * Registration creates a Domain record, renewals extend expiresAt, etc.
 */
export class SimulatedRegistrar implements RegistrarAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async checkAvailability(domain: string): Promise<AvailabilityResult> {
    const existing = await this.prisma.domain.findUnique({
      where: { name: domain.toLowerCase() },
    });

    return {
      domain,
      available: !existing,
      premium: false,
      price: undefined,
      currency: "USD",
    };
  }

  async register(
    domain: string,
    years: number,
    opts: RegisterOpts
  ): Promise<DomainResult> {
    const name = domain.toLowerCase();
    const tld = name.split(".").pop() || "";
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    const created = await this.prisma.domain.create({
      data: {
        name,
        tld,
        userId: opts.userId,
        status: "ACTIVE",
        expiresAt,
        autoRenew: opts.autoRenew ?? true,
        whoisPrivacy: opts.whoisPrivacy ?? true,
        locked: false,
      },
    });

    return {
      id: created.id,
      domain: created.name,
      status: created.status,
      registeredAt: created.registeredAt,
      expiresAt: created.expiresAt,
    };
  }

  async renew(domainId: string, years: number): Promise<DomainResult> {
    const domain = await this.prisma.domain.findUniqueOrThrow({
      where: { id: domainId },
    });

    const newExpiry = new Date(domain.expiresAt);
    newExpiry.setFullYear(newExpiry.getFullYear() + years);

    const updated = await this.prisma.domain.update({
      where: { id: domainId },
      data: { expiresAt: newExpiry, status: "ACTIVE" },
    });

    return {
      id: updated.id,
      domain: updated.name,
      status: updated.status,
      registeredAt: updated.registeredAt,
      expiresAt: updated.expiresAt,
    };
  }

  async transfer(domain: string, authCode: string): Promise<DomainResult> {
    void authCode;
    const name = domain.toLowerCase();
    const tld = name.split(".").pop() || "";
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const created = await this.prisma.domain.create({
      data: {
        name,
        tld,
        userId: "",
        status: "ACTIVE",
        expiresAt,
        autoRenew: true,
        whoisPrivacy: true,
        locked: false,
      },
    });

    return {
      id: created.id,
      domain: created.name,
      status: created.status,
      registeredAt: created.registeredAt,
      expiresAt: created.expiresAt,
    };
  }

  async lock(domainId: string): Promise<void> {
    await this.prisma.domain.update({
      where: { id: domainId },
      data: { locked: true },
    });
  }

  async unlock(domainId: string): Promise<void> {
    await this.prisma.domain.update({
      where: { id: domainId },
      data: { locked: false },
    });
  }

  async getDNSRecords(domainId: string): Promise<DNSRecordOutput[]> {
    const records = await this.prisma.dNSRecord.findMany({
      where: { domainId },
      orderBy: { createdAt: "asc" },
    });

    return records.map((r) => ({
      id: r.id,
      domainId: r.domainId,
      type: r.type,
      name: r.name,
      value: r.value,
      ttl: r.ttl,
      priority: r.priority ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async setDNSRecords(
    domainId: string,
    records: DNSRecordInput[]
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.dNSRecord.deleteMany({ where: { domainId } }),
      ...records.map((r) =>
        this.prisma.dNSRecord.create({
          data: {
            domainId,
            type: r.type,
            name: r.name,
            value: r.value,
            ttl: r.ttl ?? 3600,
            priority: r.priority,
          },
        })
      ),
    ]);
  }
}
