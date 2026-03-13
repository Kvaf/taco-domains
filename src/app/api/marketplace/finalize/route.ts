import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/marketplace/finalize — Finalize expired auctions
 * Called by the seller or automatically when viewing an ended auction.
 * Awards the domain to the highest bidder and creates a transaction.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all ended auctions belonging to this seller that have bids
    const endedAuctions = await prisma.marketplaceListing.findMany({
      where: {
        sellerId: session.user.id,
        type: "AUCTION",
        status: "ACTIVE",
        auctionEndsAt: { lt: new Date() },
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: { bidder: { select: { id: true, name: true } } },
        },
        domain: { select: { id: true, name: true } },
      },
    });

    const finalized = [];

    for (const listing of endedAuctions) {
      const highestBid = listing.bids[0];

      if (highestBid) {
        // Award to highest bidder
        await prisma.$transaction(async (tx) => {
          await tx.marketplaceListing.update({
            where: { id: listing.id },
            data: { status: "SOLD" },
          });

          await tx.domain.update({
            where: { id: listing.domain.id },
            data: { userId: highestBid.bidder.id },
          });

          await tx.transaction.create({
            data: {
              domainId: listing.domain.id,
              sellerId: listing.sellerId,
              buyerId: highestBid.bidder.id,
              amount: highestBid.amount,
              type: "AUCTION_WIN",
            },
          });
        });

        finalized.push({
          domainName: listing.domain.name,
          winner: highestBid.bidder.name ?? "Anonymous",
          amount: highestBid.amount,
        });
      } else {
        // No bids — just expire
        await prisma.marketplaceListing.update({
          where: { id: listing.id },
          data: { status: "EXPIRED" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      finalized,
      count: finalized.length,
    });
  } catch (error) {
    console.error("Finalize auctions error:", error);
    return NextResponse.json(
      { error: "Failed to finalize auctions" },
      { status: 500 }
    );
  }
}
