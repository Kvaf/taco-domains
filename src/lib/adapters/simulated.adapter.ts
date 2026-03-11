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
 * SimulatedRegistrar - stub implementation of RegistrarAdapter
 *
 * All domain operations are simulated via the database.
 * Methods will be implemented in Phases 2-5.
 */
export class SimulatedRegistrar implements RegistrarAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async checkAvailability(domain: string): Promise<AvailabilityResult> {
    throw new Error(
      `Not implemented in Phase 1: checkAvailability(${domain})`
    );
  }

  async register(
    domain: string,
    years: number,
    opts: RegisterOpts
  ): Promise<DomainResult> {
    throw new Error(
      `Not implemented in Phase 1: register(${domain}, ${years})`
    );
  }

  async renew(domainId: string, years: number): Promise<DomainResult> {
    throw new Error(
      `Not implemented in Phase 1: renew(${domainId}, ${years})`
    );
  }

  async transfer(domain: string, authCode: string): Promise<DomainResult> {
    throw new Error(
      `Not implemented in Phase 1: transfer(${domain})`
    );
  }

  async lock(domainId: string): Promise<void> {
    throw new Error(
      `Not implemented in Phase 1: lock(${domainId})`
    );
  }

  async unlock(domainId: string): Promise<void> {
    throw new Error(
      `Not implemented in Phase 1: unlock(${domainId})`
    );
  }

  async getDNSRecords(domainId: string): Promise<DNSRecordOutput[]> {
    throw new Error(
      `Not implemented in Phase 1: getDNSRecords(${domainId})`
    );
  }

  async setDNSRecords(
    domainId: string,
    records: DNSRecordInput[]
  ): Promise<void> {
    throw new Error(
      `Not implemented in Phase 1: setDNSRecords(${domainId})`
    );
  }
}
