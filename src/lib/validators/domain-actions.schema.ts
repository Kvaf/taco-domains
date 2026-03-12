import { z } from "zod/v4";

export const registerDomainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain name is too short")
    .max(253, "Domain name is too long")
    .regex(/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/, "Invalid domain format"),
  years: z.number().int().min(1).max(10).default(1),
  whoisPrivacy: z.boolean().default(true),
  autoRenew: z.boolean().default(true),
});

export const toggleDomainSettingSchema = z.object({
  domainId: z.string().min(1),
  setting: z.enum(["autoRenew", "locked", "whoisPrivacy"]),
  value: z.boolean(),
});

export const setRedirectSchema = z.object({
  domainId: z.string().min(1),
  redirectUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  redirectType: z.enum(["301", "302"]).default("301"),
});

export const renewDomainSchema = z.object({
  domainId: z.string().min(1),
  years: z.number().int().min(1).max(10).default(1),
});
