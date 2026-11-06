import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the author's Markdown. react-markdown does not render raw HTML,
 * so article text can't inject scripts. "# Heading" is demoted to h2 because
 * the page title is already the single h1.
 */
export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="post-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => {
            const external = !!href && /^https?:\/\//i.test(href);
            return external ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
