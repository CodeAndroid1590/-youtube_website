import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "../../components/AdminHeader";
import PostForm from "../../components/PostForm";

export const revalidate = 0;

export default async function NewPostPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-white mb-6">New post</h1>
        <PostForm
          post={{
            id: null,
            slug: "",
            title: "",
            excerpt: "",
            body: "",
            youtubeUrl: "",
            coverImage: "",
            topic: "",
            published: false,
          }}
        />
      </main>
    </div>
  );
}
