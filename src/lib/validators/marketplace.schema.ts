import { z } from "zod/v4";

export const LISTING_TYPES = ["FIXED_PRICE", "AUCTION"] as const;
export const LISTING_STATUSES = ["ACTIVE", "SOLD", "CANCELLED", "EXPIRED"] as const;

export const createListingSchema = z.object({
  domainId: z.string().min(1, "Domain is required"),
  type: z.enum(LISTING_TYPES),
  price: z.number().positive("Price must be greater than 0").max(999999, "Price too high"),
  minBid: z.number().positive().optional(),
  auctionDurationHours: z
    .number()
    .int()
    .min(1, "Minimum 1 hour")
    .max(168, "Maximum 7 days")
    .optional(),
});

export const placeBidSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  amount: z.number().positive("Bid must be greater than 0"),
});

export const buyNowSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
});

export const cancelListingSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
});

export const browseListingsSchema = z.object({
  search: z.string().optional(),
  type: z.enum(LISTING_TYPES).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(999999).optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "ending_soon"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});
