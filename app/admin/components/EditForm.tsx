"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVideoAction } from "../../actions/videos";

export interface EditableVideo {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export default function EditForm({ video }: { video: EditableVideo }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateVideoAction(video.id, formData);
    setLoading(false);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.error || "Failed to update video.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={video.title}
          required
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          URL Slug <span className="text-slate-500">(used in /video/&lt;slug&gt;)</span>
        </label>
        <input
          type="text"
          name="slug"
          defaultValue={video.slug ?? ""}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-[11px] text-amber-400/80 mt-1.5">
          Changing this changes the video's public URL. Old links using the previous slug will stop
          resolving.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Thumbnail URL</label>
        <input
          type="text"
          name="thumbnailUrl"
          defaultValue={video.thumbnailUrl}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
        <textarea
          name="description"
          defaultValue={video.description}
          rows={12}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <a href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors">
          Cancel
        </a>
      </div>

      {error && (
        <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg p-3">
          {error}
        </p>
      )}
    </form>
  );
}
