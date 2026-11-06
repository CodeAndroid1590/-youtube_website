import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The old /video/<slug> pages republished YouTube titles, descriptions and
 * transcripts, which Google treats as thin/duplicate content. They no longer
 * render anything. If a hand-written post exists for the same YouTube video
 * the old URL permanently redirects to it; otherwise it returns a real 404
 * so Google drops the URL instead of keeping a low-value page.
 */
export default async function LegacyVideoPage({ params }: PageProps) {
  const { slug } = await params;

  const video = await prisma.video.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { id: true },
  });

  if (video) {
    const post = await prisma.post.findFirst({
      where: { youtubeId: video.id, published: true },
      select: { slug: true },
    });
    if (post) permanentRedirect(`/blog/${post.slug}`);
  }

  notFound();
}
