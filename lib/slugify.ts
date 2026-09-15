export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
}

/**
 * Given a base slug and the YouTube video id being synced, returns a slug
 * guaranteed not to collide with a *different* video's slug already in the
 * database. Two videos landing on the same generated slug (e.g. similar
 * titles, or a title edited on YouTube to match an older video's title)
 * would otherwise silently overwrite one another's URL or, if the unique
 * constraint isn't actually enforced on the live database, produce two rows
 * with an identical slug — which is what caused the duplicate entry seen in
 * the live sitemap. Pass any Prisma client with a `video.findUnique`.
 */
export async function ensureUniqueSlug(
  prisma: { video: { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> } },
  baseSlug: string,
  videoId: string
): Promise<string> {
  let candidate = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await prisma.video.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === videoId) {
      return candidate;
    }
    attempt += 1;
    // Disambiguate deterministically using a slice of the video id so
    // re-running the sync for the same video always converges on the same
    // slug instead of appending a new suffix every time.
    candidate = `${baseSlug}-${videoId.slice(0, 6).toLowerCase()}${attempt > 1 ? `-${attempt}` : ""}`;
  }
}
