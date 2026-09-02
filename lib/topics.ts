/**
 * Lightweight, render-time topic tagging.
 *
 * We derive a small set of topic tags from each video's title/description
 * instead of requiring a database migration + backfill. This powers:
 *  - category navigation in the header
 *  - /topic/[slug] hub pages that internally link related videos together
 *  - a "Related videos" block on each video page
 *
 * Add new topics/matchers here as the channel's content grows.
 */

export interface Topic {
  slug: string;
  label: string;
  description: string;
  matchers: RegExp[];
}

export const TOPICS: Topic[] = [
  {
    slug: "claude-code",
    label: "Claude Code",
    description:
      "Setup guides, configs, and workflow tutorials for Claude Code and Claude Desktop.",
    matchers: [/claude code/i, /claude desktop/i],
  },
  {
    slug: "free-ai-tools",
    label: "Free AI Tools & Gateways",
    description:
      "Free-tier AI gateways, routers, and credit stacks like OmniRoute and OpenRouter.",
    matchers: [/omniroute/i, /openrouter/i, /free[^.]{0,20}(token|credit)s?/i, /monkeycode/i],
  },
  {
    slug: "ai-coding-agents",
    label: "AI Coding Agents",
    description:
      "Terminal and IDE coding agents — OpenCode, Codex, Antigravity, and similar tools.",
    matchers: [/opencode/i, /codex/i, /antigravity/i, /cursor/i, /copilot/i],
  },
  {
    slug: "local-ai-models",
    label: "Local AI Models",
    description:
      "Running open-weight models locally with Ollama and picking the right model for your hardware.",
    matchers: [/ollama/i, /local\s*(ai|llm|model)/i, /deepseek/i, /\bqwen\b/i, /\bllama\s?3/i, /gpt-oss/i, /minimax/i],
  },
  {
    slug: "web-dev",
    label: "Web & App Development",
    description:
      "Core developer tutorials — PHP, VS Code, SQL Server, Flutter, and Kotlin setups.",
    matchers: [/\bphp\b/i, /visual studio code/i, /\bvs code\b/i, /sql server/i, /flutter/i, /\bkotlin\b/i, /\bc#\b/i],
  },
];

export function deriveTopics(title: string, description: string | null | undefined): Topic[] {
  const haystack = `${title}\n${description || ""}`;
  return TOPICS.filter((topic) => topic.matchers.some((re) => re.test(haystack)));
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}
