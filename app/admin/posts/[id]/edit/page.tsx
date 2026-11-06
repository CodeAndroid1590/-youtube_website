import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../../../components/AdminHeader";
import PostForm from "../../../components/PostForm";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-white mb-6">Edit post</h1>
        <PostForm
          // key remounts the form (and resets its state) after a save
          key={post.updatedAt.toISOString()}
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            youtubeUrl: post.youtubeId ? `https://youtu.be/${post.youtubeId}` : "",
            coverImage: post.coverImage ?? "",
            topic: post.topic ?? "",
            published: post.published,
          }}
        />
      </main>
    </div>
  );
}
