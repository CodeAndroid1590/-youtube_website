"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncVideoAction } from "../../actions/sync";

export default function SyncForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await syncVideoAction(formData);
    setResult(res);
    setLoading(false);

    if (res.success) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="videoId"
          required
          placeholder="YouTube Video ID or full URL"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Syncing..." : "Add / Sync Video"}
        </button>
      </form>

      {result && (
        <p
          className={`mt-3 text-xs px-3 py-2 rounded-lg border ${
            result.success
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          {result.message || result.error}
        </p>
      )}
    </div>
  );
}
