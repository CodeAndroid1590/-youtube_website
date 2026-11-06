import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import PostBody from "../../components/PostBody";
import PostCard from "../../components/PostCard";
import { getPostBySlug, getPublishedPosts, postImage } from "@/lib/posts";
import { isIndexable, readingMinutes } from "@/lib/post-rules";
import { getTopicBySlug } from "@/lib/topics";
import { getSiteUrl, AUTHOR_NAME } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";

export const revalidate = 0;

const SITE_URL = getSiteUrl();
const YOUTUBE_CHANNEL_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || "https://www.youtube.com/@AIWiredOfficial159";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Drafts and unknown slugs are never indexable.
  if (!post || !post.published) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }

  const canonical = `/blog/${post.slug}`;
  const image = postImage(post);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    // Safety net: a published post that no longer passes the quality checks stays out of Google.
    robots: isIndexable(post) ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonical,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Drafts are visible to the logged-in admin only (preview), 404 for everyone else.
  if (!post || (!post.published && !(await isAuthenticated()))) {
    notFound();
  }

  const topic = post.topic ? getTopicBySlug(post.topic) : undefined;
  const related = post.topic ? await getPublishedPosts({ topic: post.topic, excludeId: post.id, take: 3 }) : [];
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const image = postImage(post);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: canonicalUrl,
    ...(image ? { image: [image] } : {}),
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: { "@type": "Organization", name: "AIWiredOfficial", url: SITE_URL },
  };

  // VideoObject lets Google show this article in video results. The article
  // text (not the YouTube description) is the page's main content; the video
  // is a supporting element, which is what Google expects on a watch-adjacent page.
  const videoJsonLd = post.youtubeId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: post.title,
        description: post.excerpt,
        thumbnailUrl: [`https://i.ytimg.com/vi/${post.youtubeId}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg`],
        uploadDate: (post.publishedAt ?? post.createdAt).toISOString(),
        embedUrl: `https://www.youtube.com/embed/${post.youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${post.youtubeId}`,
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tutorials", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        {videoJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
        )}

        {!post.published && (
          <p className="mb-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            Draft preview — only you can see this page.
          </p>
        )}

        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          {topic ? (
            <>
              <Link href={`/topic/${topic.slug}`} className="hover:text-blue-600">
                {topic.label}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link href="/blog" className="hover:text-blue-600">
                Tutorials
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-700 line-clamp-1">{post.title}</span>
        </nav>

        <article>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">{post.excerpt}</p>
          <p className="mt-4 text-xs text-slate-500">
            By {AUTHOR_NAME}
            {post.publishedAt && (
              <>
                {" · "}
                {post.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </>
            )}
            {" · "}
            {readingMinutes(post.body)} min read
            {post.updatedAt.getTime() - (post.publishedAt ?? post.createdAt).getTime() > 1000 * 60 * 60 * 24 && (
              <>
                {" · Updated "}
                {post.updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </>
            )}
          </p>

          {post.youtubeId && (
            <div className="mt-8 max-w-3xl">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${post.youtubeId}`}
                  title={`Video: ${post.title}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${post.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Watch on YouTube
              </a>
            </div>
          )}

          <div className="mt-10">
            <PostBody markdown={post.body} />
          </div>
        </article>

        <aside className="mt-14 max-w-2xl bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900">Want the full walkthrough?</h2>
          <p className="text-sm text-slate-600 mt-1">
            New tutorials on Claude Code, free AI tools and web development go up on the channel every week.
          </p>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-4 items-center px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Subscribe on YouTube
          </a>
        </aside>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">More {topic?.label} tutorials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <PostCard
                  key={p.id}
                  post={{
                    slug: p.slug,
                    title: p.title,
                    excerpt: p.excerpt,
                    image: postImage(p),
                    topic: p.topic,
                    publishedAt: p.publishedAt,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
