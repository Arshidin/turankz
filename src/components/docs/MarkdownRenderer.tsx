import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Simple Markdown Renderer
 * 
 * Renders basic markdown syntax without external dependencies.
 * Supports: headings, paragraphs, lists, code blocks, tables, callouts
 */

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split content into lines for processing
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre key={`code-${i}`} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
            <code className={codeBlockLanguage ? `language-${codeBlockLanguage}` : ''}>
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        codeBlockLanguage = trimmed.slice(3).trim();
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.slice(level).trim();
      const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      elements.push(
        <HeadingTag
          key={`heading-${i}`}
          className={cn(
            'font-bold mt-8 mb-4',
            level === 1 && 'text-4xl',
            level === 2 && 'text-3xl',
            level === 3 && 'text-2xl',
            level === 4 && 'text-xl'
          )}
        >
          {renderInlineMarkdown(text)}
        </HeadingTag>
      );
      i++;
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
      
      // Check if it's a separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        // This is the separator, headers are already captured
        i++;
        continue;
      }
      
      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      i++;
      continue;
    } else if (inTable) {
      // End table
      elements.push(
        <div key={`table-${i}`} className="my-6 overflow-x-auto">
          <table className="min-w-full border-collapse border border-border">
            <thead>
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-border px-4 py-2">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
      continue;
    }

    // Callouts (Info, Warning, Note)
    if (trimmed.startsWith('> **') || trimmed.startsWith('> ⚠') || trimmed.startsWith('> ℹ')) {
      const calloutLines: string[] = [];
      let calloutType: 'info' | 'warning' | 'note' = 'info';
      
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const calloutLine = lines[i].trim().slice(1).trim();
        if (calloutLine.includes('**Warning**') || calloutLine.includes('⚠')) {
          calloutType = 'warning';
        } else if (calloutLine.includes('**Note**') || calloutLine.includes('ℹ')) {
          calloutType = 'note';
        }
        calloutLines.push(calloutLine);
        i++;
      }
      
      const calloutContent = calloutLines.join('\n').replace(/^\*\*(Warning|Note|Info)\*\*:?\s*/i, '');
      
      elements.push(
        <div
          key={`callout-${i}`}
          className={cn(
            'my-4 p-4 rounded-lg border-l-4',
            calloutType === 'warning' && 'bg-amber-50 dark:bg-amber-950/20 border-amber-500',
            calloutType === 'info' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-500',
            calloutType === 'note' && 'bg-slate-50 dark:bg-slate-950/20 border-slate-500'
          )}
        >
          <div className="text-sm [&>p]:mb-0">
            {renderInlineMarkdown(calloutContent)}
          </div>
        </div>
      );
      continue;
    }

    // Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      const isOrdered = /^\d+\.\s/.test(trimmed);
      
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* ') || /^\d+\.\s/.test(lines[i].trim()))) {
        listItems.push(lines[i].trim().replace(/^[-*]\s|^\d+\.\s/, ''));
        i++;
      }
      
      const ListTag = isOrdered ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-${i}`} className={cn('my-4 space-y-2', isOrdered ? 'list-decimal list-inside' : 'list-disc list-inside')}>
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Paragraphs
    if (trimmed) {
      elements.push(
        <p key={`para-${i}`} className="my-4 text-foreground leading-7">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    } else {
      // Empty line
      elements.push(<br key={`br-${i}`} />);
    }

    i++;
  }

  // Close any open code block
  if (inCodeBlock) {
    elements.push(
      <pre key="code-final" className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
        <code>
          {codeBlockContent.join('\n')}
        </code>
      </pre>
    );
  }

  return <div className="prose prose-slate dark:prose-invert max-w-none">{elements}</div>;
}

/**
 * Renders inline markdown (bold, italic, code, links)
 */
function renderInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  // Patterns for inline markdown
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, render: (match: string) => <strong key={key++}>{match}</strong> },
    { regex: /\*(.+?)\*/g, render: (match: string) => <em key={key++}>{match}</em> },
    { regex: /`(.+?)`/g, render: (match: string) => <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm">{match}</code> },
    { regex: /\[(.+?)\]\((.+?)\)/g, render: (match: string, linkText: string, url: string) => (
      <a key={key++} href={url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    ) },
  ];

  let processedText = text;
  const matches: Array<{ start: number; end: number; render: () => ReactNode }> = [];

  patterns.forEach(({ regex, render }) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        render: () => {
          if (match![0].startsWith('[')) {
            const linkMatch = match![0].match(/\[(.+?)\]\((.+?)\)/);
            return render(linkMatch![0], linkMatch![1], linkMatch![2]);
          } else {
            const contentMatch = match![0].match(/\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/);
            return render(contentMatch![1] || contentMatch![2] || contentMatch![3]);
          }
        },
      });
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first)
  const nonOverlapping: typeof matches = [];
  matches.forEach((match) => {
    if (nonOverlapping.length === 0 || match.start >= nonOverlapping[nonOverlapping.length - 1].end) {
      nonOverlapping.push(match);
    }
  });

  // Build parts
  nonOverlapping.forEach((match) => {
    if (currentIndex < match.start) {
      parts.push(text.slice(currentIndex, match.start));
    }
    parts.push(match.render());
    currentIndex = match.end;
  });

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

