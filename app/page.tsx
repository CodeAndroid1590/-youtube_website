import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Link from "next/link";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              ZT
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              ZeroTokens<span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {videos.length} {videos.length === 1 ? "Video Synced" : "Videos Synced"}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-6">
          <span className="font-semibold">YouTube SEO Engine</span> &bull; Transcripts & Metadata
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          Explore AI-Indexed <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            Video Transcripts & Schema
          </span>
        </h1>
        <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Search engine optimized video knowledge base automatically processed, indexed, and formatted for maximum web search visibility.
        </p>
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
              <Link
                key={video.id}
                href={`/video/${video.slug || video.id}`}
                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="aspect-video relative w-full bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                      View Full Transcript
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>

                  {video.transcript && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20">
                      Transcript
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {video.title}
                  </h2>

                  <p className="text-slate-600 text-xs mt-2.5 line-clamp-3 leading-relaxed flex-1">
                    {video.description || "No description provided for this video."}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {video.publishedAt
                          ? new Date(video.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently Synced"}
                      </span>
                    </div>

                    <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}