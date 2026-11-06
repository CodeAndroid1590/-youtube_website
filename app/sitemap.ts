import { MetadataRoute } from "next";
import { Prisma } from "@prisma/client";
import { TOPICS } from "@/lib/topics";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

// Without this, Next.js treats sitemap.ts as a static route with no
// dynamic function calls and generates it once at build time, then serves
// that same cached output on every request until the next deploy. That's
// exactly what happened here: the sitemap froze with whatever videos were
// in the database on the last deploy (Sep 6) while new videos kept being
// added afterwards via admin syncs and the standalone sync script, neither
// of which triggers a rebuild. Forcing dynamic rendering makes sitemap.xml
// query the database fresh on every request, same as the homepage and
// topic pages already do.
export const revalidate = 0;

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

  // 2. Generate dynamic sitemap entries.
  // Defensive dedupe: slug is meant to be unique, but if the database ever
  // drifts (e.g. two videos briefly resolving to the same slug before a
  // collision is caught at sync time — see lib/slugify.ts), this guarantees
  // the sitemap never emits the same <loc> twice. When duplicates do exist,
  // keep the one with the most recent createdAt.
  const seenSlugs = new Map<string, SitemapVideoPayload>();
  for (const video of videos) {
    if (!video.slug) continue;
    const existing = seenSlugs.get(video.slug);
    if (!existing || (video.createdAt ?? new Date(0)) > (existing.createdAt ?? new Date(0))) {
      seenSlugs.set(video.slug, video);
    }
  }

  const videoUrls: MetadataRoute.Sitemap = Array.from(seenSlugs.values()).map(
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
