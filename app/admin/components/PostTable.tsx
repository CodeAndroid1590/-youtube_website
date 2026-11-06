"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePostAction } from "../../actions/posts";

export interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  words: number;
  ready: boolean;
  topic: string | null;
  updatedAt: string;
}

export default function PostTable({ posts }: { posts: AdminPostRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deletePostAction(id);
      setMessage(res.success ? res.message : res.error);
      router.refresh();
    });
  }

  if (posts.length === 0) {
    return (
      <div className="border border-dashed border-slate-800 rounded-xl p-10 text-center">
        <p className="text-sm text-slate-300">No posts yet.</p>
        <p className="text-xs text-slate-500 mt-1">
          Write your first article — a few strong posts index better than dozens of thin ones.
        </p>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <p className="mb-4 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg p-3">{message}</p>
      )}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-xs text-slate-400">
            <tr>
              <th className="text-left font-medium px-4 py-3">Title</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Words</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-slate-100 hover:text-blue-400">
                    {post.title}
                  </Link>
                  <div className="text-[11px] text-slate-500 mt-0.5">/blog/{post.slug}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {post.published ? (
                    <span className="text-xs text-emerald-400">Published</span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Draft{post.ready ? " · ready to publish" : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400">{post.words}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-blue-400 hover:text-blue-300 mr-4">
                    Edit
                  </Link>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white mr-4"
                  >
                    {post.published ? "View" : "Preview"}
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(post.id, post.title)}
                    className="text-xs text-slate-500 hover:text-rose-400 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
