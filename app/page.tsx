import { Prisma } from "@prisma/client";
import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import VideoCard from "./components/VideoCard";
import { TOPICS, deriveTopics } from "@/lib/topics";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Fetch fresh data on every request

// Infer the Video type including the optional relational transcript
type VideoWithTranscript = Prisma.VideoGetPayload<{
  include: { transcript: true };
}>;

export default async function HomePage() {
  const videos: VideoWithTranscript[] = await prisma.video.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      transcript: true,
    },
  });

  // Only show topic chips that actually have at least one matching video.
  const topicCounts = TOPICS.map((topic) => ({
    topic,
    count: videos.filter((v) => deriveTopics(v.title, v.description).some((t) => t.slug === topic.slug))
      .length,
  })).filter((entry) => entry.count > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <SiteHeader videoCount={videos.length} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-6">
          <span className="font-semibold">Free tutorials</span> &bull; Claude Code, AI tools & web dev
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          Claude Code, AI Tooling & <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            Web Dev Tutorials
          </span>
        </h1>
        <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Step-by-step guides on Claude Code, free AI coding tools, local AI models, and
          practical web development — every video comes with a full, searchable transcript
          on this site, and the complete walkthrough on YouTube.
        </p>

        {topicCounts.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {topicCounts.map(({ topic, count }) => (
              <Link
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {topic.label}
                <span className="text-slate-400">({count})</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Video Grid Section */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {videos.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">No videos indexed yet</h3>
            <p className="text-slate-500 text-xs mt-1 mb-6">
              Sync your first video using the CLI ingestion command.
            </p>
            <div className="bg-slate-900 text-slate-200 text-xs font-mono p-3 rounded-lg text-left overflow-x-auto shadow-inner">
              npx tsx scripts/sync-video.ts &lt;VIDEO_ID&gt;
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video: VideoWithTranscript) => (
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
