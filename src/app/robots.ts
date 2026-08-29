import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/dashboard",
        "/documents",
        "/expenses",
        "/fuel-energy",
        "/reminders",
        "/service",
        "/settings",
        "/statistics",
        "/vehicles",
      ],
    },
    sitemap: `${publicSiteUrl}/sitemap.xml`,
  };
}
