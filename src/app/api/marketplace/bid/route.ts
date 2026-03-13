import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { placeBidSchema } from "@/lib/validators/marketplace.schema";

/**
 * POST /api/marketplace/bid — Place a bid on an auction listing
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = placeBidSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { listingId, amount } = validation.data;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        bids: { orderBy: { amount: "desc" }, take: 1 },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Validate auction listing
    if (listing.type !== "AUCTION") {
      return NextResponse.json(
        { error: "Can only bid on auction listings" },
        { status: 400 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Auction is no longer active" },
        { status: 400 }
      );
    }

    // Check auction hasn't expired
    if (listing.auctionEndsAt && listing.auctionEndsAt < new Date()) {
      await prisma.marketplaceListing.update({
        where: { id: listingId },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Auction has ended" },
        { status: 400 }
      );
    }

    // Can't bid on own listing
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot bid on your own listing" },
        { status: 400 }
      );
    }

    // Check minimum bid
    const currentHighest = listing.bids[0]?.amount ?? 0;
    const minRequired = Math.max(listing.minBid ?? 0, currentHighest + 0.01);

    if (amount < minRequired) {
      return NextResponse.json(
        {
          error: `Bid must be at least $${minRequired.toFixed(2)}`,
          minRequired,
        },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        listingId,
        bidderId: session.user.id,
        amount,
      },
    });

    return NextResponse.json({
      success: true,
      bid: {
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}
