import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { google } from "googleapis";
import { fetchTranscript, toPlainText } from "youtube-transcript-plus";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Initialize the Prisma Postgres Adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Pass the adapter to PrismaClient
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

  // 2. Extract transcript (if available)
  let fullTextTranscript = "";
  try {
    const rawSegments = await fetchTranscript(videoId, { lang: "en" });
    fullTextTranscript = toPlainText(rawSegments);
    console.log("✅ Transcript successfully pulled.");
  } catch (error) {
    console.warn("⚠️ No captions found on YouTube, saving empty transcript.");
  }

  // 3. Save to PostgreSQL
  const savedRecord = await prisma.video.upsert({
    where: { id: videoId },
    update: {
      title: videoData.title || "",
      description: videoData.description || "",
      publishedAt: new Date(videoData.publishedAt || Date.now()),
      thumbnailUrl:
        videoData.thumbnails?.maxres?.url ||
        videoData.thumbnails?.high?.url ||
        "",
    },
    create: {
      id: videoId,
      title: videoData.title || "",
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

  console.log(`🎉 Saved "${savedRecord.title}" to PostgreSQL!`);
  return savedRecord;
}

// Test script run
const TEST_VIDEO_ID = "qVBn3-sLucc"; // Replace with your video ID
syncSingleVideo(TEST_VIDEO_ID)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });