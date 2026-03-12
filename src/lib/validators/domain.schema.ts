import { z } from 'zod/v4';

/**
 * Validates a single domain label (the part before the TLD).
 * Rules per RFC 5891:
 * - 1-63 characters
 * - Must start and end with alphanumeric
 * - Only lowercase letters, digits, and hyphens
 * - Hyphens at positions 3-4 forbidden unless xn-- prefix (IDN)
 */
export const domainLabelSchema = z
  .string()
  .min(1, 'Domain name is required')
  .max(63, 'Domain label must be 63 characters or fewer')
  .regex(/^[a-z0-9]/, 'Must start with a letter or number')
  .regex(/[a-z0-9]$/, 'Must end with a letter or number')
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
  .refine(
    (val) => {
      // Check positions 3-4 for hyphens (0-indexed: 2-3)
      if (val.length >= 4 && val[2] === '-' && val[3] === '-') {
        return val.startsWith('xn--');
      }
      return true;
    },
    { message: 'Hyphens at positions 3-4 are reserved for internationalized domains (xn--)' }
  );

/**
 * Validates a complete domain name (label.tld).
 * Transforms to lowercase and trims whitespace.
 */
export const fullDomainSchema = z
  .string()
  .max(253, 'Domain name must be 253 characters or fewer')
  .transform((val) => val.toLowerCase().trim())
  .pipe(
    z
      .string()
      .regex(
        /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.([a-z]{2,})$/,
        'Must be a valid domain format (e.g., example.com)'
      )
  );

/**
 * Validates a batch of domain names for the search API.
 */
export const domainSearchSchema = z.object({
  domains: z.array(z.string()).min(1, 'At least one domain required').max(50, 'Maximum 50 domains per request'),
});

/**
 * Validates raw search input before TLD expansion.
 * Accepts just the name part (e.g., "taco-shop") or a full domain (e.g., "taco-shop.com").
 */
export const searchInputSchema = z
  .string()
  .min(1, 'Search query is required')
  .max(253, 'Search query is too long')
  .transform((val) => val.toLowerCase().trim())
  .pipe(
    z
      .string()
      .regex(/^[a-z0-9][a-z0-9.-]*$/, 'Only letters, numbers, hyphens, and dots allowed')
  );
