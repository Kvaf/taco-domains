"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Tag, Gavel, Globe } from "lucide-react";
import Link from "next/link";

interface DomainOption {
  id: string;
  name: string;
  status: string;
}

export default function SellDomainPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [listingType, setListingType] = useState<"FIXED_PRICE" | "AUCTION">(
    "FIXED_PRICE"
  );
  const [price, setPrice] = useState("");
  const [minBid, setMinBid] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("72");

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch("/api/domain/list");
        if (res.ok) {
          const data = await res.json();
          const activeDomains = data.domains.filter(
            (d: DomainOption) => d.status === "ACTIVE"
          );
          setDomains(activeDomains);
          if (activeDomains.length > 0) {
            setSelectedDomainId(activeDomains[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDomains();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedDomainId) {
      setError("Please select a domain");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        domainId: selectedDomainId,
        type: listingType,
        price: priceNum,
      };

      if (listingType === "AUCTION") {
        const minBidNum = parseFloat(minBid);
        if (minBid && !isNaN(minBidNum)) {
          body.minBid = minBidNum;
        }
        body.auctionDurationHours = parseInt(auctionDuration) || 72;
      }

      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/marketplace/${data.listing.id}`);
      } else {
        setError(data.error || "Failed to create listing");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-fire transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div>
        <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold">
          List Domain for Sale
        </h1>
        <p className="text-sm text-text2">
          Choose a domain and set your price or start an auction.
        </p>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Globe className="h-12 w-12 text-text3 mb-4" />
            <h2 className="font-[family-name:var(--font-anybody)] text-xl font-bold mb-2">
              No domains to sell
            </h2>
            <p className="text-sm text-text2 mb-4">
              Register a domain first before listing it for sale.
            </p>
            <Link href="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h2 className="font-[family-name:var(--font-anybody)] font-bold">
                Listing Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Domain selector */}
              <div>
                <label className="block text-xs text-text3 mb-1.5 uppercase tracking-wider">
                  Domain
                </label>
                <select
                  value={selectedDomainId}
                  onChange={(e) => setSelectedDomainId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing type */}
              <div>
                <label className="block text-xs text-text3 mb-2 uppercase tracking-wider">
                  Listing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setListingType("FIXED_PRICE")}
                    className={`flex items-center gap-3 p-4 rounded-[--radius-sm] border transition-colors ${
                      listingType === "FIXED_PRICE"
                        ? "border-fire bg-fire/5"
                        : "border-border hover:border-border2"
                    }`}
                  >
                    <Tag
                      className={`h-5 w-5 ${
                        listingType === "FIXED_PRICE"
                          ? "text-fire"
                          : "text-text3"
                      }`}
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">Fixed Price</p>
                      <p className="text-[11px] text-text3">
                        Set a buy-now price
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("AUCTION")}
                    className={`flex items-center gap-3 p-4 rounded-[--radius-sm] border transition-colors ${
                      listingType === "AUCTION"
                        ? "border-gold bg-gold/5"
                        : "border-border hover:border-border2"
                    }`}
                  >
                    <Gavel
                      className={`h-5 w-5 ${
                        listingType === "AUCTION" ? "text-gold" : "text-text3"
                      }`}
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">Auction</p>
                      <p className="text-[11px] text-text3">
                        Let buyers bid
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <Input
                  label={
                    listingType === "FIXED_PRICE"
                      ? "Price (USD)"
                      : "Buy It Now Price (USD)"
                  }
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="99.99"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Auction-specific fields */}
              {listingType === "AUCTION" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Minimum Bid (USD)"
                    value={minBid}
                    onChange={(e) => setMinBid(e.target.value)}
                    placeholder="10.00"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                  <div>
                    <label className="block text-xs text-text3 mb-1.5">
                      Duration
                    </label>
                    <select
                      value={auctionDuration}
                      onChange={(e) => setAuctionDuration(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
                    >
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">3 days</option>
                      <option value="120">5 days</option>
                      <option value="168">7 days</option>
                    </select>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red">{error}</p>}

              <Button type="submit" loading={submitting} className="w-full">
                {listingType === "FIXED_PRICE"
                  ? "List for Sale"
                  : "Start Auction"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
