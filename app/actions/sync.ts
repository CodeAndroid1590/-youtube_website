"use server";

import { google } from "googleapis";
import { fetchTranscript, toPlainText } from "youtube-transcript-plus";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Helper function to extract YouTube Video ID from full URLs or raw IDs
 */
function extractVideoId(input: string): string {
  const trimmed = input.trim();

  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  // Short URL: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];

  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  // Assume raw Video ID
  return trimmed;
}

export async function syncVideoAction(formData: FormData) {
  if (!(await isAuthenticated())) {
    return { success: false, error: "Please log in to continue." };
  }

  try {
    const rawInput = formData.get("videoId") as string;
    if (!rawInput) {
      return { success: false, error: "Please provide a valid YouTube Video ID or URL." };
    }

    const videoId = extractVideoId(rawInput);
    console.log(`⏳ Admin Engine processing video: ${videoId}...`);

    // 1. Fetch metadata from YouTube API
    const response = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    const videoData = response.data.items?.[0]?.snippet;
    if (!videoData) {
      return { success: false, error: `Video ID "${videoId}" not found on YouTube.` };
    }

    // 2. Generate SEO slug from title with fallback
    const videoTitle = videoData.title || "";
    let generatedSlug = slugify(videoTitle);

    if (!generatedSlug || generatedSlug.trim() === "") {
      generatedSlug = `video-${videoId}`;
    }

    // 3. Extract transcript (if available)
    let fullTextTranscript = "";
    try {
      const rawSegments = await fetchTranscript(videoId, { lang: "en" });
      fullTextTranscript = toPlainText(rawSegments);
      console.log("✅ Transcript successfully pulled.");
    } catch (error) {
      console.warn("⚠️ No captions found on YouTube, saving without transcript.");
    }

    // 4. Save/Update record in PostgreSQL
    const savedRecord = await prisma.video.upsert({
      where: { id: videoId },
      update: {
        title: videoTitle,
        slug: generatedSlug, // Insert/update slug in database
        description: videoData.description || "",
        publishedAt: new Date(videoData.publishedAt || Date.now()),
        thumbnailUrl:
          videoData.thumbnails?.maxres?.url ||
          videoData.thumbnails?.high?.url ||
          "",
        ...(fullTextTranscript && {
          transcript: {
            upsert: {
              create: { fullText: fullTextTranscript },
              update: { fullText: fullTextTranscript },
            },
          },
        }),
      },
      create: {
        id: videoId,
        title: videoTitle,
        slug: generatedSlug, // Insert slug in database
        description: videoData.description || "",
        publishedAt: new Date(videoData.publishedAt || Date.now()),
        thumbnailUrl:
          videoData.thumbnails?.maxres?.url ||
          videoData.thumbnails?.high?.url ||
          "",
        transcript: fullTextTranscript
          ? { create: { fullText: fullTextTranscript } }
          : undefined,
      },
    });

    console.log(`🎉 Ingested "${savedRecord.title}" | Slug: "${savedRecord.slug}"`);

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/video/${savedRecord.slug}`);

    return {
      success: true,
      message: `Successfully synced "${savedRecord.title}"!`,
      videoId: savedRecord.slug || savedRecord.id, // Direct user to slug URL
    };
  } catch (err: any) {
    console.error("❌ Action Error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while syncing.",
    };
  }
}
