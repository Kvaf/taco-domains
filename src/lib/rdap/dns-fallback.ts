import type { DomainCheckResult } from './types';
import { TLD_MAP } from './tld-config';

interface GoogleDNSResponse {
  Status: number;
  Answer?: Array<{ name: string; type: number; data: string }>;
}

/**
 * DNS-over-HTTPS fallback for when RDAP lookups fail.
 * Uses Google's public DNS API to check if a domain resolves.
 *
 * - Status 3 (NXDOMAIN) = domain likely available
 * - Answer present = domain is taken
 * - Otherwise = unknown
 */
export async function dnsFallback(domain: string): Promise<DomainCheckResult> {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const config = TLD_MAP[tld];
  const price = config?.price ?? 0;

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { signal: AbortSignal.timeout(4000) }
    );

    if (!response.ok) {
      return { domain, tld, available: 'unknown', price, source: 'dns' };
    }

    const data: GoogleDNSResponse = await response.json();

    // NXDOMAIN = domain doesn't exist = likely available
    if (data.Status === 3) {
      return { domain, tld, available: true, price, source: 'dns' };
    }

    // Has DNS records = domain is taken
    if (data.Answer && data.Answer.length > 0) {
      return { domain, tld, available: false, price, source: 'dns' };
    }

    // No records but no NXDOMAIN = uncertain
    return { domain, tld, available: 'unknown', price, source: 'dns' };
  } catch {
    return { domain, tld, available: 'unknown', price, source: 'dns' };
  }
}
