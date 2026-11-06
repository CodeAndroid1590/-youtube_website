import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import PostCard from "../components/PostCard";
import { getPublishedPosts, postImage } from "@/lib/posts";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tutorials & Guides",
  description:
    "Written, step-by-step guides on Claude Code, free AI coding tools, local AI models and web development.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Tutorials &amp; Guides</h1>
        <p className="text-slate-600 max-w-2xl mb-8">
          Written step-by-step guides on Claude Code, free AI coding tools, local AI models and web development.
        </p>

        {posts.length === 0 ? (
          <p className="text-slate-500">New guides are on the way.</p>
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
