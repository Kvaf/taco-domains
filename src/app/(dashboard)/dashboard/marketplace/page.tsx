"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingBag,
  Gavel,
  Tag,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";

interface Listing {
  id: string;
  domainName: string;
  domainTld: string;
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
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${mins}m`;
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      params.set("sort", sort);
      params.set("page", page.toString());

      const res = await fetch(`/api/marketplace/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Countdown timer refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setListings((prev) => [...prev]); // Force re-render for countdowns
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleBuyNow(listingId: string) {
    if (!confirm("Are you sure you want to buy this domain?")) return;
    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully purchased ${data.transaction.domainName}!`);
        fetchListings();
      } else {
        alert(data.error || "Purchase failed");
      }
    } catch {
      alert("Network error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold">
            Domain Marketplace
          </h1>
          <p className="text-sm text-text2">
            Buy and sell domains. Find your perfect domain or list yours for
            sale.
          </p>
        </div>
        <Link href="/dashboard/marketplace/sell">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            List Domain
          </Button>
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: ShoppingBag,
            label: "Total Listings",
            value: pagination?.total ?? 0,
            color: "text-fire",
          },
          {
            icon: Gavel,
            label: "Live Auctions",
            value: listings.filter((l) => l.type === "AUCTION").length,
            color: "text-gold",
          },
          {
            icon: Tag,
            label: "Fixed Price",
            value: listings.filter((l) => l.type === "FIXED_PRICE").length,
            color: "text-cyan",
          },
          {
            icon: TrendingUp,
            label: "Avg Price",
            value:
              listings.length > 0
                ? formatPrice(
                    listings.reduce((s, l) => s + l.price, 0) /
                      listings.length
                  )
                : "$0",
            color: "text-lime",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-text3">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters bar */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text3" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search domains..."
              className="pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
          >
            <option value="">All Types</option>
            <option value="FIXED_PRICE">Fixed Price</option>
            <option value="AUCTION">Auction</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="ending_soon">Ending Soon</option>
          </select>
        </CardContent>
      </Card>

      {/* Listings grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-text3 mb-4" />
            <h2 className="font-[family-name:var(--font-anybody)] text-xl font-bold mb-2">
              No listings found
            </h2>
            <p className="text-sm text-text2 mb-4">
              {search
                ? "Try a different search term"
                : "Be the first to list a domain for sale!"}
            </p>
            <Link href="/dashboard/marketplace/sell">
              <Button size="sm">List a Domain</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="group hover:border-border2 transition-colors"
            >
              <CardContent className="space-y-3">
                {/* Type badge + domain name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-anybody)] font-bold text-lg truncate">
                      {listing.domainName}
                    </p>
                    <p className="text-xs text-text3">
                      by {listing.sellerName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      listing.type === "AUCTION"
                        ? "bg-gold/10 text-gold"
                        : "bg-cyan/10 text-cyan"
                    }`}
                  >
                    {listing.type === "AUCTION" ? "Auction" : "Buy Now"}
                  </span>
                </div>

                {/* Price info */}
                <div className="space-y-1">
                  {listing.type === "FIXED_PRICE" ? (
                    <p className="text-2xl font-bold text-fire">
                      {formatPrice(listing.price)}
                    </p>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gold">
                          {formatPrice(
                            listing.currentBid ?? listing.minBid ?? 0
                          )}
                        </p>
                        <span className="text-xs text-text3">
                          {listing.currentBid ? "current bid" : "starting bid"}
                        </span>
                      </div>
                      {listing.bidCount > 0 && (
                        <p className="text-xs text-text3">
                          {listing.bidCount} bid
                          {listing.bidCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Auction countdown */}
                {listing.type === "AUCTION" && listing.auctionEndsAt && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-text3" />
                    <span className="text-text2">
                      {formatTimeLeft(listing.auctionEndsAt)}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-1 flex gap-2">
                  {listing.type === "FIXED_PRICE" &&
                  listing.sellerId !== session?.user?.id ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleBuyNow(listing.id)}
                    >
                      Buy Now
                    </Button>
                  ) : listing.type === "AUCTION" ? (
                    <Link
                      href={`/dashboard/marketplace/${listing.id}`}
                      className="flex-1"
                    >
                      <Button size="sm" variant="secondary" className="w-full">
                        <Gavel className="h-3.5 w-3.5 mr-1" />
                        {listing.sellerId === session?.user?.id
                          ? "View Auction"
                          : "Place Bid"}
                      </Button>
                    </Link>
                  ) : null}
                  <Link href={`/dashboard/marketplace/${listing.id}`}>
                    <Button size="sm" variant="ghost">
                      Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
