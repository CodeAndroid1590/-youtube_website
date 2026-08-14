import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Search by slug first; fallback to id if slug is missing or matches YouTube ID
  const video = await prisma.video.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!video) return { title: "Video Not Found" };

  return {
    title: `${video.title} | ZeroTokensAI`,
    description: video.description ? video.description.slice(0, 160) : "",
    openGraph: {
      title: video.title,
      description: video.description ? video.description.slice(0, 160) : "",
      images: [video.thumbnailUrl],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params;

  // Search by slug first; fallback to id so older/direct links don't break
  const video = await prisma.video.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: { transcript: true },
  });

  if (!video) {
    notFound();
  }

  // Google VideoObject JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": [video.thumbnailUrl],
    "uploadDate": video.publishedAt ? video.publishedAt.toISOString() : new Date().toISOString(),
    "embedUrl": `https://www.youtube.com/embed/${video.id}`,
    "contentUrl": `https://www.youtube.com/watch?v=${video.id}`,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Inject JSON-LD Schema for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

      {/* Embedded Player */}
      <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden shadow-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          className="w-full h-full"
          allowFullScreen
        />
      </div>

      {/* Description Section */}
      <section className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">About This Video</h2>
        <p className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
          {video.description}
        </p>
      </section>

      {/* Transcript Section */}
      {video.transcript && (
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Video Transcript</h2>
          <div className="text-sm text-gray-600 whitespace-pre-line max-h-96 overflow-y-auto">
            {video.transcript.fullText || "No transcript text available."}
          </div>
        </section>
      )}
    </main>
  );
}