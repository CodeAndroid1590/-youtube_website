"use client";

import { useState } from "react";
import { syncVideoAction } from "../actions/sync";
import Link from "next/link";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; videoId?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await syncVideoAction(formData);

    setResult(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              ZT
            </div>
            <h1 className="text-base font-semibold text-white">Video Ingestion Engine</h1>
          </div>
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            &larr; Gallery
          </Link>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="videoId" className="block text-xs font-medium text-slate-300 mb-1.5">
              YouTube Video ID or Full URL
            </label>
            <input
              type="text"
              id="videoId"
              name="videoId"
              required
              placeholder="e.g. qVBn3-sLucc or https://youtu.be/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching & Syncing...
              </>
            ) : (
              "Sync Video & Transcript"
            )}
          </button>
        </form>

        {/* Feedback Alert */}
        {result && (
          <div
            className={`mt-4 p-3.5 rounded-lg text-xs border ${
              result.success
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }`}
          >
            <p className="font-medium">{result.message || result.error}</p>
            {result.success && result.videoId && (
              <div className="mt-2 pt-2 border-t border-emerald-800/50 flex gap-3">
                <Link
                  href={`/video/${result.videoId}`}
                  className="underline hover:text-white font-semibold"
                >
                  View Video Page &rarr;
                </Link>
                <Link href="/" className="underline hover:text-white">
                  Go to Gallery
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}