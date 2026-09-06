/**
 * Resolves the canonical site URL used for the sitemap, canonical tags, and
 * structured data. This exists because a misconfigured
 * NEXT_PUBLIC_SITE_URL in the hosting environment (e.g. a stray internal
 * Vercel value instead of the real domain) silently produces a broken
 * sitemap and wrong canonical URLs — which stops Google from indexing
 * pages at all, with no visible error anywhere. We validate the value
 * instead of trusting it blindly, and fall back to the known-good
 * production domain if it looks malformed.
 */

const FALLBACK_SITE_URL = "https://devnesthub.com";

function isValidSiteUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    // Underscores are not valid in real hostnames, and a bare hostname with
    // no dot (other than localhost) is almost never a real public domain —
    // both are strong signals of a misconfigured env var rather than an
    // actual deployment URL.
    if (parsed.hostname.includes("_")) return false;
    if (parsed.hostname !== "localhost" && !parsed.hostname.includes(".")) return false;

    return true;
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw && isValidSiteUrl(raw)) {
    return raw.replace(/\/$/, "");
  }
  return FALLBACK_SITE_URL;
}
