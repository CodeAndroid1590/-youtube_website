import Link from "next/link";
import { getTopicBySlug } from "@/lib/topics";

export interface PostCardData {
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  topic: string | null;
  publishedAt: Date | string | null;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const topic = post.topic ? getTopicBySlug(post.topic) : undefined;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {post.image && (
        <div className="aspect-video w-full bg-slate-100 overflow-hidden">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {topic && <span className="text-xs font-semibold text-blue-600 mb-2">{topic.label}</span>}
        <h2 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-slate-600 text-sm mt-2.5 line-clamp-3 leading-relaxed flex-1">{post.excerpt}</p>
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </div>
      </div>
    </Link>
  );
}
