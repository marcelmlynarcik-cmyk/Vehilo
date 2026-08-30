import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/seo-pages";
import { publicSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-30T00:00:00.000Z");
  const homeUrl = `${publicSiteUrl}/`;

  return [
    { url: homeUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    ...seoPages.map((page) => ({
      url: `${publicSiteUrl}/${page.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${publicSiteUrl}/ochrana-osobnich-udaju`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${publicSiteUrl}/podminky-pouzivani`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${publicSiteUrl}/kontakt`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
