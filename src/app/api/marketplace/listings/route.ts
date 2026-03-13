import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  createListingSchema,
  browseListingsSchema,
  cancelListingSchema,
} from "@/lib/validators/marketplace.schema";

/**
 * GET /api/marketplace/listings — Browse marketplace listings
 * Supports search, type filter, price range, sorting, pagination
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = {
      search: url.searchParams.get("search") || undefined,
      type: url.searchParams.get("type") || undefined,
      minPrice: url.searchParams.get("minPrice")
        ? Number(url.searchParams.get("minPrice"))
        : undefined,
      maxPrice: url.searchParams.get("maxPrice")
        ? Number(url.searchParams.get("maxPrice"))
        : undefined,
      sort: url.searchParams.get("sort") || undefined,
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : 1,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : 12,
    };

    const validation = browseListingsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { search, type, minPrice, maxPrice, sort, page, limit } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { status: "ACTIVE" };

    if (search) {
      where.domain = { name: { contains: search.toLowerCase() } };
    }
    if (type) {
      where.type = type;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      where.price = priceFilter;
    }

    // Check and expire auctions past their end time
    await prisma.marketplaceListing.updateMany({
      where: {
        status: "ACTIVE",
        type: "AUCTION",
        auctionEndsAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "ending_soon")
      orderBy = { auctionEndsAt: "asc" };

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          domain: { select: { name: true, tld: true } },
          seller: { select: { name: true, id: true } },
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            select: { amount: true },
          },
        },
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    const enriched = listings.map((l) => ({
      id: l.id,
      domainName: l.domain.name,
      domainTld: l.domain.tld,
      type: l.type,
      price: l.price,
      minBid: l.minBid,
      currentBid: l.bids[0]?.amount ?? null,
      bidCount: 0, // Will be filled below
      auctionEndsAt: l.auctionEndsAt?.toISOString() ?? null,
      sellerName: l.seller.name ?? "Anonymous",
      sellerId: l.seller.id,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    // Get bid counts for auction listings
    const auctionIds = enriched
      .filter((l) => l.type === "AUCTION")
      .map((l) => l.id);
    if (auctionIds.length > 0) {
      const bidCounts = await prisma.bid.groupBy({
        by: ["listingId"],
        where: { listingId: { in: auctionIds } },
        _count: { id: true },
      });
      const countMap = new Map(
        bidCounts.map((b) => [b.listingId, b._count.id])
      );
      enriched.forEach((l) => {
        if (countMap.has(l.id)) l.bidCount = countMap.get(l.id)!;
      });
    }

    return NextResponse.json({
      listings: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Browse listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/listings — Create a new listing
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domainId, type, price, minBid, auctionDurationHours } =
      validation.data;

    // Verify domain ownership
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain || domain.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Domain not found or not owned by you" },
        { status: 403 }
      );
    }

    if (domain.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active domains can be listed" },
        { status: 400 }
      );
    }

    // Check for existing active listing
    const existingListing = await prisma.marketplaceListing.findFirst({
      where: { domainId, status: "ACTIVE" },
    });

    if (existingListing) {
      return NextResponse.json(
        { error: "Domain already has an active listing" },
        { status: 409 }
      );
    }

    // Calculate auction end time
    let auctionEndsAt: Date | null = null;
    if (type === "AUCTION") {
      const hours = auctionDurationHours ?? 72; // Default 3 days
      auctionEndsAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        domainId,
        sellerId: session.user.id,
        type,
        price,
        minBid: type === "AUCTION" ? (minBid ?? price * 0.1) : null,
        auctionEndsAt,
        status: "ACTIVE",
      },
      include: {
        domain: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        domainName: listing.domain.name,
        type: listing.type,
        price: listing.price,
        minBid: listing.minBid,
        auctionEndsAt: listing.auctionEndsAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/listings — Cancel a listing
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = cancelListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: validation.data.listingId },
    });

    if (!listing || listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Listing not found or not owned by you" },
        { status: 403 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active listings can be cancelled" },
        { status: 400 }
      );
    }

    await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel listing error:", error);
    return NextResponse.json(
      { error: "Failed to cancel listing" },
      { status: 500 }
    );
  }
}
