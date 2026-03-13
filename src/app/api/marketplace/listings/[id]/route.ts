import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/marketplace/listings/[id] — Get listing detail with bid history
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        domain: {
          select: {
            name: true,
            tld: true,
            registeredAt: true,
            expiresAt: true,
          },
        },
        seller: { select: { name: true, id: true } },
        bids: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            bidder: { select: { name: true, id: true } },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if auction expired
    if (
      listing.type === "AUCTION" &&
      listing.status === "ACTIVE" &&
      listing.auctionEndsAt &&
      listing.auctionEndsAt < new Date()
    ) {
      await prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: "EXPIRED" },
      });
      listing.status = "EXPIRED";
    }

    const highestBid = listing.bids[0]?.amount ?? null;
    const bidCount = listing.bids.length;

    return NextResponse.json({
      listing: {
        id: listing.id,
        domainName: listing.domain.name,
        domainTld: listing.domain.tld,
        domainRegisteredAt: listing.domain.registeredAt.toISOString(),
        domainExpiresAt: listing.domain.expiresAt.toISOString(),
        type: listing.type,
        price: listing.price,
        minBid: listing.minBid,
        currentBid: highestBid,
        bidCount,
        auctionEndsAt: listing.auctionEndsAt?.toISOString() ?? null,
        sellerName: listing.seller.name ?? "Anonymous",
        sellerId: listing.seller.id,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        bids: listing.bids.map((b) => ({
          id: b.id,
          amount: b.amount,
          bidderName: b.bidder.name ?? "Anonymous",
          bidderId: b.bidder.id,
          createdAt: b.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
