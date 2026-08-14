import { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 1. Fetch all synced videos using existing model fields
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // 2. Generate dynamic sitemap entries
  const videoUrls: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${baseUrl}/video/${video.id}`,
    lastModified: video.createdAt || video.publishedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

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