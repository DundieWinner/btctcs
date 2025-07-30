import React from "react";

interface MarkdownLinkParserProps {
  text: string;
  className?: string;
}

// Function to parse markdown links and render as React elements
export function parseMarkdownLinks(text: string): (string | React.ReactNode)[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the link as a React element
    parts.push(
      <a
        key={keyCounter++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-500 underline hover:text-orange-400 transition-colors"
      >
        {match[1]}
      </a>,
    );

    lastIndex = linkRegex.lastIndex;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function MarkdownLinkParser({
  text,
  className,
}: MarkdownLinkParserProps) {
  return <p className={className}>{parseMarkdownLinks(text)}</p>;
}
