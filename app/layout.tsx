import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://devnesthub.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Claude Code, AI Coding & Free AI Tool Tutorials | ZeroTokensAI",
    template: "%s | ZeroTokensAI",
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
    name: "ZeroTokensAI",
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
