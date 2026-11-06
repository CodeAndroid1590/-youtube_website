/**
 * Pure (no database) rules for blog posts. Shared by the admin form (live
 * checklist), the save action (hard gate before publishing), the article
 * page (robots noindex safety net) and the sitemap.
 *
 * Why a gate at all: Google groups pages that are short, templated or
 * copied from elsewhere under "low-value content" and then crawls the whole
 * site less. A post only goes public if it clears the basics below.
 */

export const MIN_WORDS_TO_PUBLISH = 300;
export const TITLE_MAX = 70;
export const EXCERPT_MIN = 70;
export const EXCERPT_MAX = 160;
export const MIN_HEADINGS = 2;

/** Words of real prose: code blocks, inline code, URLs and markdown symbols are ignored. */
export function countWords(markdown: string): number {
  const text = (markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#>*_~|\-]+/g, " ");
  const words = text.match(/[\p{L}\p{N}']+/gu);
  return words ? words.length : 0;
}

export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / 220));
}

export function countHeadings(markdown: string): number {
  const withoutCode = (markdown || "").replace(/```[\s\S]*?```/g, " ");
  return (withoutCode.match(/^#{2,3}\s+\S/gm) || []).length;
}

// Leftovers that show up in YouTube descriptions and must never reach a page.
const PLACEHOLDER_RE =
  /\[(?:insert|your|add|link|url|provider|date)[^\]]*\]|\b\d{1,2}:xx\b|\bTODO\b|lorem ipsum/i;

export interface PostDraft {
  title: string;
  excerpt: string;
  body: string;
}

export interface PublishCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export function checkPost(post: PostDraft): PublishCheck[] {
  const words = countWords(post.body);
  const title = post.title.trim();
  const excerpt = post.excerpt.trim();
  const placeholder = PLACEHOLDER_RE.exec(`${title}\n${excerpt}\n${post.body}`);

  return [
    {
      label: `Title is set and at most ${TITLE_MAX} characters`,
      ok: title.length > 0 && title.length <= TITLE_MAX,
      detail: `${title.length} characters`,
    },
    {
      label: `Summary is ${EXCERPT_MIN}–${EXCERPT_MAX} characters (used as the Google description)`,
      ok: excerpt.length >= EXCERPT_MIN && excerpt.length <= EXCERPT_MAX,
      detail: `${excerpt.length} characters`,
    },
    {
      label: `Article has at least ${MIN_WORDS_TO_PUBLISH} words of written text`,
      ok: words >= MIN_WORDS_TO_PUBLISH,
      detail: `${words} words (code blocks and links don't count)`,
    },
    {
      label: `Article has at least ${MIN_HEADINGS} section headings (## Heading)`,
      ok: countHeadings(post.body) >= MIN_HEADINGS,
      detail: `${countHeadings(post.body)} headings`,
    },
    {
      label: "No leftover placeholders like [INSERT LINK] or 00:xx",
      ok: !placeholder,
      detail: placeholder ? `Found: ${placeholder[0]}` : undefined,
    },
  ];
}

export function publishProblems(post: PostDraft): string[] {
  return checkPost(post)
    .filter((c) => !c.ok)
    .map((c) => (c.detail ? `${c.label} — ${c.detail}` : c.label));
}

/** Safety net used at render time: only substantial published posts are indexable. */
export function isIndexable(post: PostDraft & { published: boolean }): boolean {
  return post.published && publishProblems(post).length === 0;
}
