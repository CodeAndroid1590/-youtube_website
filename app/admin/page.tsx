import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "./components/AdminHeader";
import PostTable from "./components/PostTable";
import { countWords, publishProblems } from "@/lib/post-rules";

export const revalidate = 0;

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Posts</h1>
            <p className="text-xs text-slate-400 mt-1">
              {publishedCount} published · {posts.length - publishedCount} drafts. Only published posts appear on
              the site and in the sitemap.
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            New post
          </Link>
        </div>

        <PostTable
          posts={posts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            published: p.published,
            words: countWords(p.body),
            ready: publishProblems(p).length === 0,
            topic: p.topic,
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
