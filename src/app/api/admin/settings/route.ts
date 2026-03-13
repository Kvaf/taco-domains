import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getSiteSettings,
  updateSiteSettings,
} from "@/lib/settings/site-settings";

/**
 * GET /api/admin/settings — Get current site settings
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

/**
 * PATCH /api/admin/settings — Update site settings
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    // Only allow known boolean fields + maintenanceMessage
    const allowed = [
      "domainSearch",
      "domainRegistration",
      "dnsManagement",
      "marketplace",
      "signup",
      "maintenanceMode",
      "maintenanceMessage",
    ] as const;

    const update: Record<string, boolean | string | null> = {};
    for (const key of allowed) {
      if (key in body) {
        update[key] = body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const settings = await updateSiteSettings(update);
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
