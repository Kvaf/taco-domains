/**
 * Cloudflare DNS API Client
 * Manages DNS records via Cloudflare's v4 API
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

interface CloudflareDNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  priority?: number;
  proxied?: boolean;
  comment?: string;
  created_on: string;
  modified_on: string;
}

interface CloudflareResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: string[];
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    total_count: number;
    count: number;
  };
}

export interface DNSRecord {
  id?: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  priority?: number;
  proxied?: boolean;
}

function getConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!apiToken) throw new Error("CLOUDFLARE_API_TOKEN is not set");
  return { apiToken };
}

function headers() {
  const { apiToken } = getConfig();
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * List all zones accessible by this token
 */
export async function listZones(): Promise<
  { id: string; name: string; status: string }[]
> {
  const res = await fetch(`${CF_API_BASE}/zones?per_page=50`, {
    headers: headers(),
  });
  const data: CloudflareResponse<{ id: string; name: string; status: string }[]> =
    await res.json();

  if (!data.success) {
    throw new Error(`Cloudflare API error: ${data.errors.map((e) => e.message).join(", ")}`);
  }
  return data.result;
}

/**
 * Get the Zone ID for a domain name.
 * First checks CLOUDFLARE_ZONE_MAP env var, then falls back to API lookup.
 */
export async function getZoneId(domainName: string): Promise<string | null> {
  // Extract the root domain (e.g., "sub.mrcrypto.se" -> "mrcrypto.se")
  const parts = domainName.split(".");
  const rootDomain = parts.slice(-2).join(".");

  // Check zone map env var first (format: "domain1:zoneId1,domain2:zoneId2")
  const zoneMap = process.env.CLOUDFLARE_ZONE_MAP || "";
  for (const entry of zoneMap.split(",")) {
    const [domain, zoneId] = entry.split(":");
    if (domain?.trim() === rootDomain && zoneId?.trim()) {
      return zoneId.trim();
    }
  }

  // Fallback: look up via API
  try {
    const res = await fetch(
      `${CF_API_BASE}/zones?name=${encodeURIComponent(rootDomain)}`,
      { headers: headers() }
    );
    const data: CloudflareResponse<{ id: string }[]> = await res.json();
    if (data.success && data.result.length > 0) {
      return data.result[0].id;
    }
  } catch (err) {
    console.error("Failed to look up zone:", err);
  }

  return null;
}

/**
 * List all DNS records for a zone
 */
export async function listRecords(zoneId: string): Promise<DNSRecord[]> {
  const allRecords: DNSRecord[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${CF_API_BASE}/zones/${zoneId}/dns_records?per_page=100&page=${page}`,
      { headers: headers() }
    );
    const data: CloudflareResponse<CloudflareDNSRecord[]> = await res.json();

    if (!data.success) {
      throw new Error(
        `Cloudflare API error: ${data.errors.map((e) => e.message).join(", ")}`
      );
    }

    for (const r of data.result) {
      allRecords.push({
        id: r.id,
        type: r.type,
        name: r.name,
        content: r.content,
        ttl: r.ttl,
        priority: r.priority,
        proxied: r.proxied,
      });
    }

    if (
      !data.result_info ||
      page * data.result_info.per_page >= data.result_info.total_count
    ) {
      break;
    }
    page++;
  }

  return allRecords;
}

/**
 * Create a DNS record
 */
export async function createRecord(
  zoneId: string,
  record: Omit<DNSRecord, "id">
): Promise<DNSRecord> {
  const body: Record<string, unknown> = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied ?? false,
  };

  if (record.type === "MX" || record.type === "SRV") {
    body.priority = record.priority ?? 10;
  }

  const res = await fetch(`${CF_API_BASE}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data: CloudflareResponse<CloudflareDNSRecord> = await res.json();

  if (!data.success) {
    throw new Error(
      `Failed to create record: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }

  return {
    id: data.result.id,
    type: data.result.type,
    name: data.result.name,
    content: data.result.content,
    ttl: data.result.ttl,
    priority: data.result.priority,
    proxied: data.result.proxied,
  };
}

/**
 * Update a DNS record
 */
export async function updateRecord(
  zoneId: string,
  recordId: string,
  record: Omit<DNSRecord, "id">
): Promise<DNSRecord> {
  const body: Record<string, unknown> = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied ?? false,
  };

  if (record.type === "MX" || record.type === "SRV") {
    body.priority = record.priority ?? 10;
  }

  const res = await fetch(
    `${CF_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    }
  );

  const data: CloudflareResponse<CloudflareDNSRecord> = await res.json();

  if (!data.success) {
    throw new Error(
      `Failed to update record: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }

  return {
    id: data.result.id,
    type: data.result.type,
    name: data.result.name,
    content: data.result.content,
    ttl: data.result.ttl,
    priority: data.result.priority,
    proxied: data.result.proxied,
  };
}

/**
 * Delete a DNS record
 */
export async function deleteRecord(
  zoneId: string,
  recordId: string
): Promise<void> {
  const res = await fetch(
    `${CF_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  const data: CloudflareResponse<{ id: string }> = await res.json();

  if (!data.success) {
    throw new Error(
      `Failed to delete record: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }
}

/**
 * Get DNSSEC status for a zone
 */
export async function getDNSSEC(
  zoneId: string
): Promise<{ status: string; flags: number | null }> {
  const res = await fetch(`${CF_API_BASE}/zones/${zoneId}/dnssec`, {
    headers: headers(),
  });
  const data: CloudflareResponse<{ status: string; flags: number | null }> =
    await res.json();

  if (!data.success) {
    throw new Error(
      `Failed to get DNSSEC: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }
  return data.result;
}
