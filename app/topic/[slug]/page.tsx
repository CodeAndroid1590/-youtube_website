import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import VideoCard from "../../components/VideoCard";
import { getTopicBySlug, deriveTopics, TOPICS } from "@/lib/topics";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export const revalidate = 0;

type VideoWithTranscript = Prisma.VideoGetPayload<{
  include: { transcript: true };
}>;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Topic Not Found" };

  return {
    title: `${topic.label} Tutorials`,
    description: topic.description,
    alternates: {
      canonical: `/topic/${topic.slug}`,
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const allVideos: VideoWithTranscript[] = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
    include: { transcript: true },
  });

  const videos = allVideos.filter((v) =>
    deriveTopics(v.title, v.description).some((t) => t.slug === topic.slug)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">{topic.label}</span>
        </nav>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          {topic.label} Tutorials
        </h1>
        <p className="text-slate-600 max-w-2xl mb-8">{topic.description}</p>

        {videos.length === 0 ? (
          <p className="text-slate-500">No videos in this topic yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={{
                  id: video.id,
                  slug: video.slug,
                  title: video.title,
                  description: video.description,
                  thumbnailUrl: video.thumbnailUrl,
                  publishedAt: video.publishedAt,
                  hasTranscript: Boolean(video.transcript),
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
