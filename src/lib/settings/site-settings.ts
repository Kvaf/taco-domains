import { prisma } from "@/lib/db/prisma";

export type SiteSettingsData = {
  domainSearch: boolean;
  domainRegistration: boolean;
  dnsManagement: boolean;
  marketplace: boolean;
  signup: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
};

const SETTINGS_ID = "default";

/**
 * Fetches site settings, creating default row if it doesn't exist.
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });

  return {
    domainSearch: settings.domainSearch,
    domainRegistration: settings.domainRegistration,
    dnsManagement: settings.dnsManagement,
    marketplace: settings.marketplace,
    signup: settings.signup,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
  };
}

/**
 * Updates site settings. Only provided fields are updated.
 */
export async function updateSiteSettings(
  data: Partial<SiteSettingsData>
): Promise<SiteSettingsData> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  return {
    domainSearch: settings.domainSearch,
    domainRegistration: settings.domainRegistration,
    dnsManagement: settings.dnsManagement,
    marketplace: settings.marketplace,
    signup: settings.signup,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
  };
}
