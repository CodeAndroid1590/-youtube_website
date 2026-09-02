import { MetadataRoute } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TOPICS } from "@/lib/topics";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Define specific payload selection type for explicit mapping inference
type SitemapVideoPayload = Prisma.VideoGetPayload<{
  select: {
    slug: true;
    publishedAt: true;
    createdAt: true;
  };
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fallback base URL ensures valid URLs during local development or build time
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://devnesthub.com"
  ).replace(/\/$/, "");

  // 1. Fetch all synced videos using existing model fields
  const videos: SitemapVideoPayload[] = await prisma.video.findMany({
    select: {
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // 2. Generate dynamic sitemap entries
  const videoUrls: MetadataRoute.Sitemap = videos.map(
    (video: SitemapVideoPayload) => ({
      url: `${baseUrl}/video/${video.slug}`,
      lastModified: video.createdAt || video.publishedAt || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // 3. Topic hub pages — these carry internal links to related videos,
  // so they're worth listing explicitly.
  const topicUrls: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${baseUrl}/topic/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 4. Static routes. Note: /admin is intentionally excluded — it's an
  // internal ingestion tool, already disallowed in robots.ts, and has no
  // reason to be crawled or indexed.
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  return [...staticUrls, ...topicUrls, ...videoUrls];
}
