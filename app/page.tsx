import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import PostCard from "./components/PostCard";
import { TOPICS } from "@/lib/topics";
import { getPublishedPosts, postImage } from "@/lib/posts";

export const revalidate = 0; // Fetch fresh data on every request

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOME_POST_LIMIT = 12;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  // Only show topic chips that actually have at least one published post.
  const topicCounts = TOPICS.map((topic) => ({
    topic,
    count: posts.filter((p) => p.topic === topic.slug).length,
  })).filter((entry) => entry.count > 0);

  const visible = posts.slice(0, HOME_POST_LIMIT);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <SiteHeader />

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
          Step-by-step written guides on Claude Code, free AI coding tools, local AI models, and practical web
          development — with the exact commands and settings, and the full video walkthrough on YouTube.
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

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {visible.length === 0 ? (
          <p className="text-center text-slate-500 py-16">New guides are on the way.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((p) => (
                <PostCard
                  key={p.id}
                  post={{
                    slug: p.slug,
                    title: p.title,
                    excerpt: p.excerpt,
                    image: postImage(p),
                    topic: p.topic,
                    publishedAt: p.publishedAt,
                  }}
                />
              ))}
            </div>
            {posts.length > HOME_POST_LIMIT && (
              <div className="text-center mt-10">
                <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                  See all {posts.length} tutorials &rarr;
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
