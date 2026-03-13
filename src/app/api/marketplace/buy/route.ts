import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { buyNowSchema } from "@/lib/validators/marketplace.schema";

/**
 * POST /api/marketplace/buy — Buy Now on a fixed-price listing
 * Transfers domain ownership to buyer and creates a transaction record
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = buyNowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { listingId } = validation.data;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        domain: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing is no longer active" },
        { status: 400 }
      );
    }

    if (listing.type !== "FIXED_PRICE") {
      return NextResponse.json(
        { error: "Buy Now is only available for fixed-price listings" },
        { status: 400 }
      );
    }

    // Can't buy own listing
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot buy your own listing" },
        { status: 400 }
      );
    }

    // Execute purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark listing as sold
      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: { status: "SOLD" },
      });

      // Transfer domain ownership
      await tx.domain.update({
        where: { id: listing.domainId },
        data: { userId: session.user.id },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          domainId: listing.domainId,
          sellerId: listing.sellerId,
          buyerId: session.user.id,
          amount: listing.price,
          type: "PURCHASE",
        },
      });

      return transaction;
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: result.id,
        domainName: listing.domain.name,
        amount: result.amount,
        type: result.type,
      },
    });
  } catch (error) {
    console.error("Buy now error:", error);
    return NextResponse.json(
      { error: "Purchase failed" },
      { status: 500 }
    );
  }
}
