import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroTokensAI Video Engine",
  description: "SEO-optimized YouTube video transcripts and schema data.",
  verification: {
    google: "B_EJK-6YeAu2xpggIdHK1RQK5RDMd7ImfdTf4dBV5Tc", //B_EJK-6YeAu2xpggIdHK1RQK5RDMd7ImfdTf4dBV5Tc
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
      </body>
    </html>
  );
}