export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vehilo.eu";

  return siteUrl.replace(/\/+$/, "");
}

export const publicSiteUrl = getSiteUrl();
