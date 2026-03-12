import PQueue from 'p-queue';
import { TLD_MAP } from './tld-config';
import { dnsFallback } from './dns-fallback';
import type { DomainCheckResult } from './types';

export type { DomainCheckResult };

const RDAP_TIMEOUT = 6000;

// Per-server rate limiting queues
const queues = new Map<string, PQueue>();

function getQueue(server: string): PQueue {
  let queue = queues.get(server);
  if (!queue) {
    queue = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 5 });
    queues.set(server, queue);
  }
  return queue;
}

/**
 * Check a single domain's availability via RDAP.
 * Falls back to DNS-over-HTTPS if RDAP fails.
 */
export async function checkSingleDomain(domain: string): Promise<DomainCheckResult> {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const config = TLD_MAP[tld];

  // Unknown TLD
  if (!config) {
    return { domain, tld, available: 'unknown', price: 0, source: 'rdap' };
  }

  // .taco is always available (simulated TLD)
  if (tld === 'taco') {
    return { domain, tld, available: true, price: config.price, source: 'simulated' };
  }

  // No RDAP server configured
  if (!config.rdapServer) {
    return { domain, tld, available: 'unknown', price: config.price, source: 'rdap' };
  }

  const queue = getQueue(config.rdapServer);

  try {
    return await queue.add(async () => {
      const rdapUrl = config.rdapServer!.includes('rdap.org')
        ? `https://rdap.org/domain/${domain}`
        : `${config.rdapServer}/domain/${domain}`;

      const response = await fetch(rdapUrl, {
        signal: AbortSignal.timeout(RDAP_TIMEOUT),
        headers: { Accept: 'application/rdap+json' },
      });

      // 404 or 400 = domain not found = available
      if (response.status === 404 || response.status === 400) {
        return { domain, tld, available: true, price: config.price, source: 'rdap' as const };
      }

      // 200 = check response body for domain registration data
      if (response.ok) {
        const data = await response.json();
        if (data.objectClassName === 'domain' || data.ldhName) {
          return { domain, tld, available: false, price: config.price, source: 'rdap' as const };
        }
      }

      // Any other status = unknown
      return { domain, tld, available: 'unknown', price: config.price, source: 'rdap' as const };
    }) as DomainCheckResult;
  } catch {
    // RDAP failed, fall back to DNS
    return dnsFallback(domain);
  }
}

/**
 * Check multiple domains in parallel.
 */
export async function checkDomains(domains: string[]): Promise<DomainCheckResult[]> {
  return Promise.all(domains.map(checkSingleDomain));
}
