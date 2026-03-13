"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Gavel,
  Clock,
  User,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface BidEntry {
  id: string;
  amount: number;
  bidderName: string;
  bidderId: string;
  createdAt: string;
}

interface ListingDetail {
  id: string;
  domainName: string;
  domainTld: string;
  domainRegisteredAt: string;
  domainExpiresAt: string;
  type: "FIXED_PRICE" | "AUCTION";
  price: number;
  minBid: number | null;
  currentBid: number | null;
  bidCount: number;
  auctionEndsAt: string | null;
  sellerName: string;
  sellerId: string;
  status: string;
  createdAt: string;
  bids: BidEntry[];
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Auction ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketplace/listings/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setListing(data.listing);
        if (data.listing.type === "AUCTION" && data.listing.currentBid) {
          setBidAmount((data.listing.currentBid + 1).toFixed(2));
        } else if (data.listing.type === "AUCTION" && data.listing.minBid) {
          setBidAmount(data.listing.minBid.toFixed(2));
        }
      } else {
        router.push("/dashboard/marketplace");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Live countdown timer
  useEffect(() => {
    if (!listing?.auctionEndsAt) return;
    const update = () => setTimeLeft(formatTimeLeft(listing.auctionEndsAt!));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [listing?.auctionEndsAt]);

  async function handlePlaceBid() {
    if (!listing) return;
    setBidError("");
    setBidding(true);

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError("Enter a valid bid amount");
      setBidding(false);
      return;
    }

    try {
      const res = await fetch("/api/marketplace/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchListing();
        setBidError("");
      } else {
        setBidError(data.error || "Failed to place bid");
      }
    } catch {
      setBidError("Network error");
    } finally {
      setBidding(false);
    }
  }

  async function handleBuyNow() {
    if (!listing) return;
    if (!confirm(`Buy ${listing.domainName} for ${formatPrice(listing.price)}?`))
      return;

    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully purchased ${data.transaction.domainName}!`);
        router.push("/dashboard");
      } else {
        alert(data.error || "Purchase failed");
      }
    } catch {
      alert("Network error");
    }
  }

  async function handleCancel() {
    if (!listing) return;
    if (!confirm("Cancel this listing? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/marketplace/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      if (res.ok) {
        router.push("/dashboard/marketplace");
      }
    } catch {
      alert("Failed to cancel listing");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
      </div>
    );
  }

  if (!listing) return null;

  const isOwner = listing.sellerId === session?.user?.id;
  const isAuction = listing.type === "AUCTION";
  const isActive = listing.status === "ACTIVE";
  const hasEnded =
    isAuction &&
    listing.auctionEndsAt &&
    new Date(listing.auctionEndsAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-fire transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-[family-name:var(--font-anybody)] text-3xl font-bold">
                    {listing.domainName}
                  </h1>
                  <p className="text-sm text-text3 mt-1">
                    Listed by {listing.sellerName} on{" "}
                    {formatDate(listing.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    listing.status === "ACTIVE"
                      ? "bg-green/10 text-green"
                      : listing.status === "SOLD"
                      ? "bg-fire/10 text-fire"
                      : "bg-text3/10 text-text3"
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              {/* Domain info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  {
                    icon: Calendar,
                    label: "Registered",
                    value: formatDate(listing.domainRegisteredAt),
                  },
                  {
                    icon: Calendar,
                    label: "Expires",
                    value: formatDate(listing.domainExpiresAt),
                  },
                  {
                    icon: Shield,
                    label: "Extension",
                    value: `.${listing.domainTld}`,
                  },
                  {
                    icon: Gavel,
                    label: "Type",
                    value: isAuction ? "Auction" : "Fixed Price",
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text3">
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-[11px] uppercase tracking-wider">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bid history for auctions */}
          {isAuction && (
            <Card>
              <CardHeader>
                <h2 className="font-[family-name:var(--font-anybody)] font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  Bid History ({listing.bidCount})
                </h2>
              </CardHeader>
              <CardContent>
                {listing.bids.length === 0 ? (
                  <p className="text-sm text-text3 text-center py-4">
                    No bids yet. Be the first to bid!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {listing.bids.map((bid, i) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between py-2 px-3 rounded-[--radius-xs] ${
                          i === 0
                            ? "bg-gold/5 border border-gold/20"
                            : "border border-border/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-surface2 flex items-center justify-center text-xs font-bold text-text3">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <User className="h-3 w-3 text-text3" />
                              {bid.bidderName}
                              {i === 0 && (
                                <span className="text-[10px] text-gold font-bold">
                                  HIGHEST
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-text3">
                              {formatDate(bid.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-bold ${
                            i === 0 ? "text-gold text-lg" : "text-text2"
                          }`}
                        >
                          {formatPrice(bid.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — price + actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              {isAuction ? (
                <>
                  {/* Auction countdown */}
                  {listing.auctionEndsAt && (
                    <div className="text-center py-3 rounded-[--radius-xs] bg-bg">
                      <div className="flex items-center justify-center gap-1.5 text-text3 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">
                          {hasEnded ? "Auction Ended" : "Time Remaining"}
                        </span>
                      </div>
                      <p
                        className={`text-xl font-bold font-mono ${
                          hasEnded ? "text-red" : "text-gold"
                        }`}
                      >
                        {timeLeft}
                      </p>
                    </div>
                  )}

                  {/* Current bid */}
                  <div className="text-center">
                    <p className="text-xs text-text3 uppercase tracking-wider mb-1">
                      {listing.currentBid ? "Current Bid" : "Starting Bid"}
                    </p>
                    <p className="text-3xl font-bold text-gold">
                      {formatPrice(
                        listing.currentBid ?? listing.minBid ?? 0
                      )}
                    </p>
                    {listing.bidCount > 0 && (
                      <p className="text-xs text-text3 mt-1">
                        {listing.bidCount} bid
                        {listing.bidCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Bid form */}
                  {isActive && !hasEnded && !isOwner && (
                    <div className="space-y-3 pt-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text3" />
                        <Input
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Your bid"
                          className="pl-8"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      {bidError && (
                        <p className="text-xs text-red">{bidError}</p>
                      )}
                      <Button
                        className="w-full"
                        onClick={handlePlaceBid}
                        loading={bidding}
                      >
                        <Gavel className="h-4 w-4 mr-1" />
                        Place Bid
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Fixed price */}
                  <div className="text-center">
                    <p className="text-xs text-text3 uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="text-3xl font-bold text-fire">
                      {formatPrice(listing.price)}
                    </p>
                  </div>

                  {isActive && !isOwner && (
                    <Button className="w-full" onClick={handleBuyNow}>
                      Buy Now — {formatPrice(listing.price)}
                    </Button>
                  )}
                </>
              )}

              {/* Owner actions */}
              {isOwner && isActive && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel Listing
                </Button>
              )}

              {!isActive && (
                <div className="text-center py-2">
                  <p className="text-sm text-text3">
                    This listing is{" "}
                    <span className="font-medium text-text2">
                      {listing.status.toLowerCase()}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
