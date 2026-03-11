/**
 * RegistrarAdapter interface
 *
 * Defines the contract for domain registrar operations.
 * All domain operations go through this interface, allowing
 * the simulated backend to be swapped for a real registrar API later.
 */

export interface AvailabilityResult {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: number;
  currency?: string;
}

export interface RegisterOpts {
  userId: string;
  whoisPrivacy?: boolean;
  autoRenew?: boolean;
  nameservers?: string[];
}

export interface DomainResult {
  id: string;
  domain: string;
  status: string;
  registeredAt: Date;
  expiresAt: Date;
}

export interface DNSRecordInput {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface DNSRecordOutput extends DNSRecordInput {
  id: string;
  domainId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrarAdapter {
  /** Check if a domain name is available for registration */
  checkAvailability(domain: string): Promise<AvailabilityResult>;

  /** Register a new domain */
  register(
    domain: string,
    years: number,
    opts: RegisterOpts
  ): Promise<DomainResult>;

  /** Renew an existing domain registration */
  renew(domainId: string, years: number): Promise<DomainResult>;

  /** Initiate a domain transfer */
  transfer(domain: string, authCode: string): Promise<DomainResult>;

  /** Lock a domain to prevent unauthorized transfers */
  lock(domainId: string): Promise<void>;

  /** Unlock a domain to allow transfers */
  unlock(domainId: string): Promise<void>;

  /** Get DNS records for a domain */
  getDNSRecords(domainId: string): Promise<DNSRecordOutput[]>;

  /** Set DNS records for a domain (replaces existing) */
  setDNSRecords(
    domainId: string,
    records: DNSRecordInput[]
  ): Promise<void>;
}
