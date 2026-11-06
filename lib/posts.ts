import { prisma } from "@/lib/prisma";

/** Published posts, newest first. Optionally filter by topic slug. */
export async function getPublishedPosts(opts: { topic?: string; take?: number; excludeId?: string } = {}) {
  return prisma.post.findMany({
    where: {
      published: true,
      ...(opts.topic ? { topic: opts.topic } : {}),
      ...(opts.excludeId ? { id: { not: opts.excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    ...(opts.take ? { take: opts.take } : {}),
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export type PostRecord = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

/** Cover image for cards / social previews: explicit cover, else the embedded video's thumbnail. */
export function postImage(post: { coverImage: string | null; youtubeId: string | null }): string | null {
  if (post.coverImage) return post.coverImage;
  if (post.youtubeId) return `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg`;
  return null;
}
