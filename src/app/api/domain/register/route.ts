import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { registrar } from "@/lib/adapters";
import { registerDomainSchema } from "@/lib/validators/domain-actions.schema";
import { TLD_MAP } from "@/lib/rdap/tld-config";
import { checkFeature } from "@/lib/settings/feature-gate";

export async function POST(req: NextRequest) {
  try {
    const gate = await checkFeature("domainRegistration");
    if (gate) return gate;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = registerDomainSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domain, years, whoisPrivacy, autoRenew } = validation.data;
    const tld = domain.split(".").pop() || "";
    const config = TLD_MAP[tld];

    // Check simulated availability (is it already registered in our DB?)
    const availability = await registrar.checkAvailability(domain);
    if (!availability.available) {
      return NextResponse.json(
        { error: "Domain is not available" },
        { status: 409 }
      );
    }

    const result = await registrar.register(domain, years, {
      userId: session.user.id,
      whoisPrivacy,
      autoRenew,
    });

    return NextResponse.json({
      success: true,
      domain: result,
      price: config?.price ?? 0,
      totalPrice: (config?.price ?? 0) * years,
    });
  } catch (error) {
    console.error("Domain registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
