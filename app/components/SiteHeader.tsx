import Link from "next/link";
import { TOPICS } from "@/lib/topics";

// Set NEXT_PUBLIC_YOUTUBE_CHANNEL_URL in your deployment env to point this
// at the exact channel you want this site sending traffic to.
const YOUTUBE_CHANNEL_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || "https://www.youtube.com/@setupwalapro";

export default function SiteHeader({ videoCount }: { videoCount?: number }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            ZT
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            ZeroTokens<span className="text-blue-600">AI</span>
          </span>
        </Link>

        <nav
          aria-label="Topics"
          className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 overflow-x-auto"
        >
          {TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topic/${topic.slug}`}
              className="hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {topic.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {typeof videoCount === "number" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {videoCount} {videoCount === 1 ? "Video Synced" : "Videos Synced"}
            </span>
          )}
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-sm shadow-red-500/20"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
            </svg>
            Subscribe on YouTube
          </a>
        </div>
      </div>
    </header>
  );
}
