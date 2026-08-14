import { MetadataRoute } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Define specific payload selection type for explicit mapping inference
type SitemapVideoPayload = Prisma.VideoGetPayload<{
  select: {
    id: true;
    publishedAt: true;
    createdAt: true;
  };
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fallback base URL ensures valid URLs during local development or build time
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://zerotokensai.com"
  ).replace(/\/$/, "");

  // 1. Fetch all synced videos using existing model fields
  const videos: SitemapVideoPayload[] = await prisma.video.findMany({
    select: {
      id: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // 2. Generate dynamic sitemap entries
  const videoUrls: MetadataRoute.Sitemap = videos.map(
    (video: SitemapVideoPayload) => ({
      url: `${baseUrl}/video/${video.id}`,
      lastModified: video.createdAt || video.publishedAt || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // 3. Static routes
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...videoUrls];
}