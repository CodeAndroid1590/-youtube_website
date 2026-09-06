import { MetadataRoute } from "next";
import { Prisma } from "@prisma/client";
import { TOPICS } from "@/lib/topics";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

// Define specific payload selection type for explicit mapping inference
type SitemapVideoPayload = Prisma.VideoGetPayload<{
  select: {
    slug: true;
    publishedAt: true;
    createdAt: true;
  };
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Validated so a misconfigured env var can't silently point every URL in
  // this sitemap at a broken domain (this happened before via a stray
  // internal Vercel value — Google simply can't index pages that way).
  const baseUrl = getSiteUrl();

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
