import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devnesthub.com/";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin", // Keep search crawlers out of the internal ingestion tool
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}