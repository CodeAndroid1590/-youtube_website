import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroTokensAI Video Engine",
  description: "SEO-optimized YouTube video transcripts and schema data.",
  verification: {
    google: "yiXvZTO-eqQybrtqtdEeus900sJZ4TPjX-OWmzY4jws", //<meta name="google-site-verification" content="yiXvZTO-eqQybrtqtdEeus900sJZ4TPjX-OWmzY4jws" />
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}