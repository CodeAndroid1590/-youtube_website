import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Claude Code, AI Coding & Free AI Tool Tutorials | AIWiredOfficial",
    template: "%s | AIWiredOfficial",
  },
  description:
    "Step-by-step tutorials on Claude Code, free AI coding tools, local AI models, and web development — with full video transcripts you can search and read.",
  verification: {
    google: "B_EJK-6YeAu2xpggIdHK1RQK5RDMd7ImfdTf4dBV5Tc",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AIWiredOfficial",
    url: SITE_URL,
    description:
      "Step-by-step tutorials on Claude Code, free AI coding tools, local AI models, and web development, with full video transcripts.",
  };

  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
