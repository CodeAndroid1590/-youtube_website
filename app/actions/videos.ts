"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function updateVideoAction(id: string, formData: FormData) {
  if (!(await isAuthenticated())) {
    return { success: false, error: "Please log in to continue." };
  }

  try {
    const title = ((formData.get("title") as string) || "").trim();
    const description = (formData.get("description") as string) || "";
    const thumbnailUrl = ((formData.get("thumbnailUrl") as string) || "").trim();
    let slug = ((formData.get("slug") as string) || "").trim();

    if (!title) {
      return { success: false, error: "Title is required." };
    }

    if (!slug) {
      slug = slugify(title) || `video-${id}`;
    } else {
      slug = slugify(slug);
    }

    // Guard against colliding with a different video's slug.
    const existing = await prisma.video.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return {
        success: false,
        error: `Slug "${slug}" is already used by another video. Choose a different one.`,
      };
    }

    const oldRecord = await prisma.video.findUnique({ where: { id } });

    const updated = await prisma.video.update({
      where: { id },
      data: { title, description, thumbnailUrl, slug },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/video/${updated.slug}`);
    if (oldRecord?.slug && oldRecord.slug !== updated.slug) {
      revalidatePath(`/video/${oldRecord.slug}`);
    }

    return { success: true, message: `Updated "${updated.title}".` };
  } catch (err: any) {
    console.error("❌ updateVideoAction error:", err);
    return { success: false, error: err.message || "Failed to update video." };
  }
}

export async function deleteVideoAction(id: string) {
  if (!(await isAuthenticated())) {
    return { success: false, error: "Please log in to continue." };
  }

  try {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return { success: false, error: "Video not found." };
    }

    // Transcript is deleted automatically via onDelete: Cascade in the schema.
    await prisma.video.delete({ where: { id } });

    revalidatePath("/admin");
    revalidatePath("/");
    if (video.slug) revalidatePath(`/video/${video.slug}`);

    return { success: true, message: `Deleted "${video.title}".` };
  } catch (err: any) {
    console.error("❌ deleteVideoAction error:", err);
    return { success: false, error: err.message || "Failed to delete video." };
  }
}
