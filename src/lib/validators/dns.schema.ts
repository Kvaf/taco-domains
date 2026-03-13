import { z } from "zod/v4";

export const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"] as const;

export const dnsRecordSchema = z.object({
  type: z.enum(DNS_RECORD_TYPES),
  name: z
    .string()
    .min(1, "Name is required")
    .max(253, "Name is too long")
    .regex(/^[@*a-z0-9._-]+$/i, "Invalid record name"),
  value: z.string().min(1, "Value is required").max(4096, "Value is too long"),
  ttl: z.number().int().min(60).max(86400).default(3600),
  priority: z.number().int().min(0).max(65535).optional(),
});

export const createDnsRecordSchema = z.object({
  domainId: z.string().min(1),
  record: dnsRecordSchema,
});

export const updateDnsRecordSchema = z.object({
  recordId: z.string().min(1),
  domainId: z.string().min(1).optional(),
  record: dnsRecordSchema,
});

export const deleteDnsRecordSchema = z.object({
  recordId: z.string().min(1),
  domainId: z.string().min(1).optional(),
});

export const toggleDnssecSchema = z.object({
  domainId: z.string().min(1),
  enabled: z.boolean(),
});
