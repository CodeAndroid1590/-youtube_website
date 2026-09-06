"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteVideoAction } from "../../actions/videos";
import { syncVideoAction } from "../../actions/sync";

export interface AdminVideoRow {
  id: string;
  slug: string | null;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: Date | string | null;
  hasTranscript: boolean;
}

export default function VideoTable({ videos }: { videos: AdminVideoRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = videos.filter((v) => v.title.toLowerCase().includes(search.toLowerCase()));

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This also removes its transcript. This can't be undone.`)) {
      return;
    }
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteVideoAction(id);
      setMessage(res.success ? `Deleted "${title}".` : res.error || "Failed to delete.");
      setBusyId(null);
      router.refresh();
    });
  }

  function handleResync(id: string, title: string) {
    setBusyId(id);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("videoId", id);
      const res = await syncVideoAction(formData);
      setMessage(res.success ? `Re-synced "${title}".` : res.error || "Failed to re-sync.");
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

      {message && (
        <p className="mb-4 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg p-3">
          {message}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((video) => {
          const isBusy = pending && busyId === video.id;
          return (
            <div
              key={video.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3"
            >
              <img
                src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                className="w-full sm:w-24 aspect-video object-cover rounded-lg flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{video.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "No date"}
                  {" · "}
                  {video.hasTranscript ? "Has transcript" : "No transcript"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <Link
                  href={`/video/${video.slug || video.id}`}
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/admin/${video.id}/edit`}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleResync(video.id, video.title)}
                  disabled={isBusy}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isBusy ? "..." : "Re-sync"}
                </button>
                <button
                  onClick={() => handleDelete(video.id, video.title)}
                  disabled={isBusy}
                  className="text-xs bg-rose-900/60 hover:bg-rose-800 text-rose-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No videos match your search.</p>
        )}
      </div>
    </div>
  );
}
