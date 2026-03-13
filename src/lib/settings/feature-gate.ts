import { NextResponse } from "next/server";
import { getSiteSettings, SiteSettingsData } from "./site-settings";

type FeatureKey = keyof Omit<SiteSettingsData, "maintenanceMode" | "maintenanceMessage">;

/**
 * Checks if a feature is enabled. Returns a 503 response if disabled.
 * Use in API route handlers:
 *
 * ```ts
 * const gate = await checkFeature("domainSearch");
 * if (gate) return gate; // 503 Service Unavailable
 * ```
 */
export async function checkFeature(
  feature: FeatureKey
): Promise<NextResponse | null> {
  const settings = await getSiteSettings();

  if (settings.maintenanceMode) {
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        message: settings.maintenanceMessage ?? "The site is under maintenance.",
      },
      { status: 503 }
    );
  }

  if (!settings[feature]) {
    const labels: Record<FeatureKey, string> = {
      domainSearch: "Domain search",
      domainRegistration: "Domain registration",
      dnsManagement: "DNS management",
      marketplace: "Marketplace",
      signup: "User registration",
    };

    return NextResponse.json(
      {
        error: "Feature disabled",
        message: `${labels[feature]} is currently disabled by the administrator.`,
      },
      { status: 503 }
    );
  }

  return null;
}
