import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { google } from "googleapis";
import { fetchTranscript, toPlainText } from "youtube-transcript-plus";
import dotenv from "dotenv";
import { slugify } from "./lib/slugify"; // Use "@/lib/slugify" or "../lib/slugify" depending on your folder location

// Load environment variables from .env
dotenv.config();

// 1. Initialize PostgreSQL Connection Pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({ connectionString });

// 2. Initialize the Prisma Postgres Adapter using pg.Pool
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to PrismaClient
const prisma = new PrismaClient({ adapter });

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function syncSingleVideo(videoId: string) {
  console.log(`⏳ Fetching data for YouTube video: ${videoId}...`);

  // 1. Get metadata from YouTube API
  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [videoId],
  });

  const videoData = response.data.items?.[0]?.snippet;
  if (!videoData) {
    throw new Error(`Video ID ${videoId} not found on YouTube.`);
  }

  // 2. Generate SEO slug from video title with a safe fallback
  const videoTitle = videoData.title || "";
  let generatedSlug = slugify(videoTitle);

  // If slugify returns an empty string (e.g. title with only special characters), fallback to videoId
  if (!generatedSlug || generatedSlug.trim() === "") {
    generatedSlug = `video-${videoId}`;
  }

  console.log(`📌 Title: "${videoTitle}"`);
  console.log(`📌 Generated Slug: "${generatedSlug}"`);

  // 3. Extract transcript (if available)
  let fullTextTranscript = "";
  try {
    const rawSegments = await fetchTranscript(videoId, { lang: "en" });
    fullTextTranscript = toPlainText(rawSegments);
    console.log("✅ Transcript successfully pulled.");
  } catch (error) {
    console.warn("⚠️ No captions found on YouTube, proceeding without transcript.");
  }

  // 4. Save to PostgreSQL with slug
  const savedRecord = await prisma.video.upsert({
    where: { id: videoId },
    update: {
      title: videoTitle,
      slug: generatedSlug,
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
      slug: generatedSlug,
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

  console.log(`🎉 Saved "${savedRecord.title}" (Slug: ${savedRecord.slug}) to PostgreSQL!`);
  return savedRecord;
}

// Test script run
const TEST_VIDEO_ID = "qVBn3-sLucc"; // Replace with your video ID

async function main() {
  try {
    await syncSingleVideo(TEST_VIDEO_ID);
  } catch (err) {
    console.error("❌ Sync Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();