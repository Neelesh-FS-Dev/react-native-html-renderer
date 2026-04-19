/**
 * Minimal Markdown → HTML converter.
 *
 * Supports a pragmatic subset: headings, bold, italic, inline code, code
 * blocks, links, images, unordered/ordered lists, blockquotes, horizontal
 * rules, and paragraphs. Not CommonMark-compliant. For full fidelity, use
 * a dedicated parser (marked, markdown-it) and feed its HTML to HtmlRenderer.
 */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let inList: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${inlineFormat(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };

  for (const raw of lines) {
    const line = raw;

    if (/^```/.test(line)) {
      flushParagraph();
      closeList();
      if (inCode) {
        out.push('</code></pre>');
        inCode = false;
      } else {
        out.push('<pre><code>');
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1]!.length;
      out.push(`<h${level}>${inlineFormat(heading[2]!)}</h${level}>`);
      continue;
    }

    if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      flushParagraph();
      closeList();
      out.push('<hr />');
      continue;
    }

    const blockquote = /^>\s?(.*)$/.exec(line);
    if (blockquote) {
      flushParagraph();
      closeList();
      out.push(`<blockquote>${inlineFormat(blockquote[1]!)}</blockquote>`);
      continue;
    }

    const ulItem = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ulItem) {
      flushParagraph();
      if (inList !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = 'ul';
      }
      out.push(`<li>${inlineFormat(ulItem[1]!)}</li>`);
      continue;
    }

    const olItem = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (olItem) {
      flushParagraph();
      if (inList !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = 'ol';
      }
      out.push(`<li>${inlineFormat(olItem[1]!)}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFormat(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}
