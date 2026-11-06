import { MetadataRoute } from "next";
import { TOPICS } from "@/lib/topics";
import { getPublishedPosts } from "@/lib/posts";
import { isIndexable } from "@/lib/post-rules";
import { getSiteUrl } from "@/lib/site";

// Query the database on every request so new posts show up without a redeploy.
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Only published posts that pass the quality checks are listed — the same
  // rule the article page uses to decide between index / noindex.
  const posts = (await getPublishedPosts()).filter((p) => isIndexable(p));

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Topic hubs are only listed once they contain at least one post.
  const topicUrls: MetadataRoute.Sitemap = TOPICS.filter((topic) => posts.some((p) => p.topic === topic.slug)).map(
    (topic) => ({
      url: `${baseUrl}/topic/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...(posts.length > 0
      ? [{ url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 }]
      : []),
  ];

  return [...staticUrls, ...topicUrls, ...postUrls];
}
