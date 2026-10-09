"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

type CardDescriptionViewerProps = {
  content: string | null | undefined;
  className?: string;
};

export default function CardDescriptionViewer({
  content,
  className = "",
}: CardDescriptionViewerProps) {
  const description = content?.trim();

  if (!description) {
    return (
      <p
        className={`text-sm leading-6 text-[var(--color-text-muted)] ${className}`}
      >
        No description added.{" "}
      </p>
    );
  }

  return (
    <div
      className={`min-w-0 break-words text-sm leading-6 text-[var(--color-text-secondary)] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-4 text-2xl font-semibold text-[var(--color-text-primary)]">
              {children}{" "}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
              {children}{" "}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
              {children}{" "}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 whitespace-pre-wrap">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[var(--color-primary)] underline underline-offset-2"
            >
              {children}{" "}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-[var(--color-border)] pl-4 italic text-[var(--color-text-secondary)]">
              {children}{" "}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-[var(--color-column-bg)] p-3 font-mono text-xs leading-5">
              {children}{" "}
            </pre>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className?.includes("language-"));

            return isBlock ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-[var(--color-column-bg)] px-1.5 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            );
          },
          hr: () => (
            <hr className="my-4 border-0 border-t border-[var(--color-border)]" />
          ),
          table: ({ children }) => (
            <div className="my-3 max-w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--color-column-bg)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-text-primary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--color-border)] px-3 py-2">
              {children}
            </td>
          ),
          input: ({ type, checked, disabled }) =>
            type === "checkbox" ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled ?? true}
                readOnly
                className="mr-2 accent-[var(--color-primary)]"
              />
            ) : null,
          img: () => null,
        }}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
