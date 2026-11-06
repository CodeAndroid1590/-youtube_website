import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import PostCard from "../../components/PostCard";
import { getTopicBySlug, TOPICS } from "@/lib/topics";
import { getPublishedPosts, postImage } from "@/lib/posts";

export const revalidate = 0;

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

  const posts = await getPublishedPosts({ topic: topic.slug });

  return {
    title: `${topic.label} Tutorials`,
    description: topic.description,
    alternates: {
      canonical: `/topic/${topic.slug}`,
    },
    // An empty topic hub is a thin page; keep it out of Google until it has posts.
    robots: posts.length === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const posts = await getPublishedPosts({ topic: topic.slug });

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

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{topic.label} Tutorials</h1>
        <p className="text-slate-600 max-w-2xl mb-8">{topic.description}</p>

        {posts.length === 0 ? (
          <p className="text-slate-500">No tutorials in this topic yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
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
        )}
      </main>
    </div>
  );
}
