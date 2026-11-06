/**
 * Extracts a YouTube video id from a watch / youtu.be / embed URL or a raw
 * id. Returns null if the value doesn't look like a valid 11-character id.
 * Used only to embed a video on a post; no metadata is fetched from YouTube.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  const value = (input || "").trim();
  if (!value) return null;

  const patterns = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /embed\/([\w-]{11})/, /shorts\/([\w-]{11})/];
  for (const re of patterns) {
    const match = value.match(re);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : null;
}
