import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import VideoCard from "../../components/VideoCard";
import { cleanDescription, extractHashtags } from "@/lib/content";
import { deriveTopics } from "@/lib/topics";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Singleton instance to prevent connection pool exhaustion during hot reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://devnesthub.com").replace(/\/$/, "");
const YOUTUBE_CHANNEL_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || "https://www.youtube.com/@setupwalapro";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Fetch video by slug (or fallback to id)
 */
async function getVideo(slugOrId: string) {
  return await prisma.video.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
    include: { transcript: true },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) return { title: "Video Not Found" };

  const description = cleanDescription(video.description).slice(0, 160);
  const canonicalPath = `/video/${video.slug || video.id}`;

  return {
    title: video.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: video.title,
      description,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
      type: "video.other",
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  // FORCE REDIRECT: If accessed via ID (e.g. /video/dQw4w9WgXcQ), update URL bar to /video/your-slug-title
  if (video.slug && slug !== video.slug) {
    redirect(`/video/${video.slug}`);
  }

  const topics = deriveTopics(video.title, video.description);
  const cleanedDescription = cleanDescription(video.description);
  const hashtags = extractHashtags(video.description);

  // Related videos: prefer other videos that share at least one derived
  // topic, so near-duplicate/overlapping tutorials link to each other
  // instead of silently competing for the same search queries.
  let relatedVideos: Awaited<ReturnType<typeof getVideo>>[] = [];
  if (topics.length > 0) {
    const candidates = await prisma.video.findMany({
      where: { id: { not: video.id } },
      include: { transcript: true },
      orderBy: { publishedAt: "desc" },
      take: 60,
    });
    relatedVideos = candidates
      .filter((v: (typeof candidates)[number]) =>
        deriveTopics(v.title, v.description).some((t) => topics.some((vt) => vt.slug === t.slug))
      )
      .slice(0, 3);
  }

  const canonicalUrl = `${SITE_URL}/video/${video.slug || video.id}`;

  // Google VideoObject JSON-LD Schema
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: cleanedDescription || video.title,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.publishedAt ? new Date(video.publishedAt).toISOString() : new Date().toISOString(),
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    ...(video.transcript?.fullText ? { transcript: video.transcript.fullText } : {}),
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(topics[0]
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: topics[0].label,
              item: `${SITE_URL}/topic/${topics[0].slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: topics[0] ? 3 : 2,
        name: video.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Inject JSON-LD Schema for crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />

        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          {topics[0] && (
            <>
              <span>/</span>
              <Link href={`/topic/${topics[0].slug}`} className="hover:text-blue-600">
                {topics[0].label}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-700 line-clamp-1">{video.title}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-slate-900">{video.title}</h1>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                {topic.label}
              </Link>
            ))}
          </div>
        )}

        {/* Embedded Player */}
        <div className="aspect-video w-full mb-3 rounded-xl overflow-hidden shadow-lg bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {/* Watch on YouTube / Subscribe CTA */}
        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Watch on YouTube
          </a>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Subscribe for more tutorials
          </a>
        </div>

        {/* Transcript Section — the real spoken transcript is the primary,
            unique content on this page, so it comes before the description. */}
        {video.transcript?.fullText && (
          <section className="mb-8 bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Full Video Transcript</h2>
            <div className="text-sm text-slate-600 whitespace-pre-line max-h-[32rem] overflow-y-auto leading-relaxed">
              {video.transcript.fullText}
            </div>
          </section>
        )}

        {/* Description Section — cleaned of keyword-stuffed tails */}
        {cleanedDescription && (
          <section className="mb-8 bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-semibold mb-2 text-slate-900">About This Video</h2>
            <p className="whitespace-pre-line text-slate-700 text-sm leading-relaxed">
              {cleanedDescription}
            </p>
          </section>
        )}

        {hashtags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {relatedVideos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Related Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedVideos.map((v) =>
                v ? (
                  <VideoCard
                    key={v.id}
                    video={{
                      id: v.id,
                      slug: v.slug,
                      title: v.title,
                      description: v.description,
                      thumbnailUrl: v.thumbnailUrl,
                      publishedAt: v.publishedAt,
                      hasTranscript: Boolean(v.transcript),
                    }}
                  />
                ) : null
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
