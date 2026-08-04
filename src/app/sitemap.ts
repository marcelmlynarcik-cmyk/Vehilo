import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: publicSiteUrl,
      lastModified: new Date("2026-08-04T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
