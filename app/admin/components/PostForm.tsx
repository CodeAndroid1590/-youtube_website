"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { savePostAction } from "../../actions/posts";
import { TOPICS } from "@/lib/topics";
import { checkPost, countWords, EXCERPT_MAX, TITLE_MAX } from "@/lib/post-rules";

export interface EditablePost {
  id: string | null;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  youtubeUrl: string;
  coverImage: string;
  topic: string;
  published: boolean;
}

const inputClass =
  "w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-xs font-medium text-slate-300 mb-1.5";

export default function PostForm({ post }: { post: EditablePost }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [body, setBody] = useState(post.body);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const checks = useMemo(() => checkPost({ title, excerpt, body }), [title, excerpt, body]);
  const words = useMemo(() => countWords(body), [body]);
  const allOk = checks.every((c) => c.ok);

  async function submit(intent: "draft" | "publish") {
    if (!formRef.current) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await savePostAction(post.id, new FormData(formRef.current), intent);
    setLoading(false);

    if (!res.success) {
      setError(res.error);
      return;
    }
    if (post.id) {
      setNotice(res.message);
      router.refresh();
    } else {
      router.push(`/admin/posts/${res.id}/edit`);
    }
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="grid lg:grid-cols-[1fr_18rem] gap-8">
      <div className="space-y-5 min-w-0">
        <div>
          <label className={labelClass}>
            Title <span className="text-slate-500">({title.length}/{TITLE_MAX})</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Write it for a person searching Google, not for YouTube"
          />
        </div>

        <div>
          <label className={labelClass}>
            Summary <span className="text-slate-500">({excerpt.length}/{EXCERPT_MAX}) — shown in Google results</span>
          </label>
          <textarea
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="One or two sentences that say what the reader will be able to do after this article."
          />
        </div>

        <div>
          <label className={labelClass}>
            Article <span className="text-slate-500">(Markdown · {words} words)</span>
          </label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={26}
            className={`${inputClass} font-mono leading-relaxed`}
            placeholder={"Short intro: what this solves and who it's for.\n\n## Before you start\n\n## Step 1: ...\n\n## Common errors\n\n## Summary"}
          />
        </div>
      </div>

      <aside className="space-y-5">
        <div>
          <label className={labelClass}>
            URL slug <span className="text-slate-500">(/blog/&lt;slug&gt;)</span>
          </label>
          <input type="text" name="slug" defaultValue={post.slug} className={inputClass} placeholder="auto from title" />
          {post.published && (
            <p className="text-[11px] text-amber-400/80 mt-1.5">
              Changing the slug of a published post breaks its existing links.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Topic</label>
          <select name="topic" defaultValue={post.topic} className={inputClass}>
            <option value="">No topic</option>
            {TOPICS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            YouTube video <span className="text-slate-500">(optional, embed only)</span>
          </label>
          <input
            type="text"
            name="youtubeUrl"
            defaultValue={post.youtubeUrl}
            className={inputClass}
            placeholder="https://youtu.be/…"
          />
        </div>

        <div>
          <label className={labelClass}>
            Cover image URL <span className="text-slate-500">(optional)</span>
          </label>
          <input type="text" name="coverImage" defaultValue={post.coverImage} className={inputClass} placeholder="https://…" />
        </div>

        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
          <h3 className="text-xs font-semibold text-slate-200 mb-3">Needed to publish</h3>
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="text-[11px] leading-snug">
                <span className={c.ok ? "text-emerald-400" : "text-slate-500"}>{c.ok ? "✓" : "○"}</span>{" "}
                <span className={c.ok ? "text-slate-300" : "text-slate-400"}>{c.label}</span>
                {!c.ok && c.detail && <div className="text-slate-500 ml-4">{c.detail}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {post.published ? (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => submit("publish")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => submit("draft")}
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                Unpublish
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={loading || !allOk}
                onClick={() => submit("publish")}
                title={allOk ? "" : "Complete the checklist first"}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
              >
                {loading ? "Saving..." : "Publish"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => submit("draft")}
                className="text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
            </>
          )}
          <a href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors">
            Back to posts
          </a>
        </div>

        {notice && (
          <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-lg p-3">{notice}</p>
        )}
        {error && (
          <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg p-3 whitespace-pre-line">
            {error}
          </p>
        )}
      </aside>
    </form>
  );
}
