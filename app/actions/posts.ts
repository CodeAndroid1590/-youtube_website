"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { getTopicBySlug } from "@/lib/topics";
import { parseYouTubeId } from "@/lib/youtube";
import { publishProblems } from "@/lib/post-rules";

export type SavePostResult =
  | { success: true; message: string; id: string; slug: string }
  | { success: false; error: string };

function revalidatePostPaths(slug: string, oldSlug?: string | null, topic?: string | null) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath(`/blog/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/blog/${oldSlug}`);
  if (topic) revalidatePath(`/topic/${topic}`);
}

/**
 * Creates (id = null) or updates a post. `intent` decides the status:
 *  - "draft":   saved without any checks, never visible publicly
 *  - "publish": must pass the quality checks in lib/post-rules.ts first
 */
export async function savePostAction(
  id: string | null,
  formData: FormData,
  intent: "draft" | "publish"
): Promise<SavePostResult> {
  if (!(await isAuthenticated())) {
    return { success: false, error: "Please log in to continue." };
  }

  try {
    const title = ((formData.get("title") as string) || "").trim();
    const excerpt = ((formData.get("excerpt") as string) || "").trim();
    const body = ((formData.get("body") as string) || "").replace(/\r\n/g, "\n").trim();
    const rawSlug = ((formData.get("slug") as string) || "").trim();
    const topicInput = ((formData.get("topic") as string) || "").trim();
    const youtubeInput = ((formData.get("youtubeUrl") as string) || "").trim();
    const coverImage = ((formData.get("coverImage") as string) || "").trim();

    if (!title) return { success: false, error: "Title is required." };

    const slug = slugify(rawSlug || title);
    if (!slug) return { success: false, error: "Could not build a URL slug from that title." };

    let topic: string | null = null;
    if (topicInput) {
      if (!getTopicBySlug(topicInput)) return { success: false, error: "Unknown topic." };
      topic = topicInput;
    }

    let youtubeId: string | null = null;
    if (youtubeInput) {
      youtubeId = parseYouTubeId(youtubeInput);
      if (!youtubeId) {
        return { success: false, error: "That doesn't look like a YouTube link or video id." };
      }
    }

    if (coverImage && !/^https?:\/\//i.test(coverImage)) {
      return { success: false, error: "Cover image must be a full https:// URL." };
    }

    const clash = await prisma.post.findUnique({ where: { slug } });
    if (clash && clash.id !== id) {
      return { success: false, error: `The slug "${slug}" is already used by another post.` };
    }

    const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
    if (id && !existing) return { success: false, error: "Post not found." };

    const publishing = intent === "publish";

    if (publishing) {
      const problems = publishProblems({ title, excerpt, body });
      if (problems.length > 0) {
        return {
          success: false,
          error: `Not published yet. Fix these first:\n• ${problems.join("\n• ")}`,
        };
      }

      // Identical titles or summaries across posts look like duplicate content.
      const duplicate = await prisma.post.findFirst({
        where: {
          published: true,
          ...(id ? { id: { not: id } } : {}),
          OR: [
            { title: { equals: title, mode: "insensitive" } },
            { excerpt: { equals: excerpt, mode: "insensitive" } },
          ],
        },
        select: { title: true },
      });
      if (duplicate) {
        return {
          success: false,
          error: `Not published yet. Another published post already uses the same title or summary ("${duplicate.title}"). Each page needs its own.`,
        };
      }
    }

    const data = {
      slug,
      title,
      excerpt,
      body,
      youtubeId,
      coverImage: coverImage || null,
      topic,
      published: publishing,
      // Keep the original publish date when re-publishing or editing.
      publishedAt: publishing ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
    };

    const saved = existing
      ? await prisma.post.update({ where: { id: existing.id }, data })
      : await prisma.post.create({ data });

    revalidatePostPaths(saved.slug, existing?.slug, saved.topic);
    if (existing?.topic && existing.topic !== saved.topic) revalidatePath(`/topic/${existing.topic}`);

    return {
      success: true,
      id: saved.id,
      slug: saved.slug,
      message: publishing ? `Published "${saved.title}".` : `Saved draft "${saved.title}".`,
    };
  } catch (err: any) {
    console.error("❌ savePostAction error:", err);
    return { success: false, error: err.message || "Failed to save post." };
  }
}

export async function deletePostAction(id: string) {
  if (!(await isAuthenticated())) {
    return { success: false as const, error: "Please log in to continue." };
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return { success: false as const, error: "Post not found." };

    await prisma.post.delete({ where: { id } });
    revalidatePostPaths(post.slug, null, post.topic);

    return { success: true as const, message: `Deleted "${post.title}".` };
  } catch (err: any) {
    console.error("❌ deletePostAction error:", err);
    return { success: false as const, error: err.message || "Failed to delete post." };
  }
}
