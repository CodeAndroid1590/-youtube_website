/**
 * YouTube descriptions are written for YouTube's own UI (chapters, links,
 * hashtag soup, and sometimes literal "related keywords" dumps for YouTube
 * search). Publishing that verbatim as on-page body copy is duplicate
 * content at best and keyword-stuffing spam at worst. These helpers clean
 * the description before we render it as a webpage, and pull hashtags out
 * separately so they can be shown as proper tags instead of raw text.
 */

const SPAM_MARKER_PATTERNS: RegExp[] = [
  /^related keywords[:\s]/i,
  /^related searches[:\s]/i,
  /^🔗?\s*related searches/i,
  /^📌\s*related searches/i,
  /^keywords[:\s]/i,
];

export function cleanDescription(raw: string | null | undefined): string {
  if (!raw) return "";

  const lines = raw.split(/\r?\n/);
  let cutoff = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (SPAM_MARKER_PATTERNS.some((re) => re.test(line))) {
      cutoff = i;
      break;
    }

    // Heuristic: a long line that's almost entirely bare words with
    // virtually no sentence punctuation reads like a keyword-stuffed tail
    // rather than something written for a human to read. Cut there.
    if (line.length > 150) {
      const punctuation = (line.match(/[.!?]/g) || []).length;
      const words = line.split(/\s+/).length;
      const hasUrl = /https?:\/\//.test(line);
      if (!hasUrl && punctuation / words < 0.01) {
        cutoff = i;
        break;
      }
    }
  }

  const kept = lines.slice(0, cutoff);

  // Drop trailing hashtag-only lines; we surface hashtags separately.
  while (kept.length && /^(#\S+\s*)+$/.test(kept[kept.length - 1].trim())) {
    kept.pop();
  }

  return kept.join("\n").trim();
}

export function extractHashtags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const matches = raw.match(/#[a-zA-Z0-9_]+/g) || [];
  const seen = new Set<string>();
  for (const tag of matches) {
    seen.add(tag.slice(1));
  }
  return Array.from(seen).slice(0, 8);
}
