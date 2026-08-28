import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-28T00:00:00.000Z");

  return [
    { url: publicSiteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${publicSiteUrl}/ochrana-osobnich-udaju`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${publicSiteUrl}/podminky-pouzivani`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${publicSiteUrl}/kontakt`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
