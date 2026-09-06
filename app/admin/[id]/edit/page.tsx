import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../../components/AdminHeader";
import EditForm from "../../components/EditForm";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageProps) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-white mb-6">Edit Video</h1>
        <EditForm
          video={{
            id: video.id,
            slug: video.slug,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
          }}
        />
      </main>
    </div>
  );
}
