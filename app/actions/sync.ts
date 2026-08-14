"use server";

import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { YoutubeTranscript } from "youtube-transcript";
import { revalidatePath } from "next/cache";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function extractVideoId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : trimmed;
}

export async function syncVideoAction(formData: FormData) {
  // 1. Verify Basic Auth Header on Action invocation
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get("authorization");

  if (authHeader) {
    const authValue = authHeader.split(" ")[1] || "";
    const [username, password] = Buffer.from(authValue, "base64")
      .toString("utf-8")
      .split(":");

    const validUser = process.env.ADMIN_USERNAME || "admin";
    const validPass = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== validUser || password !== validPass) {
      return { success: false, error: "Unauthorized action." };
    }
  }

  // 2. Normal Action Logic
  const rawInput = formData.get("videoId") as string;
  if (!rawInput) {
    return { success: false, error: "Please enter a Video ID or URL." };
  }

  const videoId = extractVideoId(rawInput);

  if (videoId.length !== 11) {
    return { success: false, error: "Invalid YouTube Video ID format." };
  }

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!oembedRes.ok) {
      return { success: false, error: "Failed to fetch video details from YouTube." };
    }

    const oembedData = await oembedRes.json();
    const title = oembedData.title || `YouTube Video (${videoId})`;
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const description = `Video tutorial for ${title}`;
    const publishedAt = new Date();

    let fullText = "";
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      fullText = transcriptItems.map((item) => item.text).join(" ");
    } catch {
      console.warn(`No transcript found for video ${videoId}`);
    }

    const video = await prisma.video.upsert({
      where: { id: videoId },
      update: { title, thumbnailUrl, description, publishedAt },
      create: { id: videoId, title, thumbnailUrl, description, publishedAt },
    });

    if (fullText) {
      await prisma.transcript.upsert({
        where: { videoId },
        update: { fullText },
        create: { videoId, fullText },
      });
    }

    revalidatePath("/");

    return {
      success: true,
      message: `Successfully synced: "${video.title}"`,
      videoId: video.id,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || "An error occurred." };
  }
}