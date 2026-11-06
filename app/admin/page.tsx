import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "./components/AdminHeader";
import SyncForm from "./components/SyncForm";
import VideoTable from "./components/VideoTable";

export const revalidate = 0;

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const videos: Prisma.VideoGetPayload<{
    include: { transcript: { select: { id: true } } };
  }>[] = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
    include: { transcript: { select: { id: true } } },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Add / Re-sync a Video</h2>
          <SyncForm />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">All Videos ({videos.length})</h2>
          <VideoTable
            videos={videos.map((v) => ({
              id: v.id,
              slug: v.slug,
              title: v.title,
              thumbnailUrl: v.thumbnailUrl,
              publishedAt: v.publishedAt,
              hasTranscript: Boolean(v.transcript),
            }))}
          />
        </section>
      </main>
    </div>
  );
}
