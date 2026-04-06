import { parseDocument } from 'htmlparser2';
import type { DOMNode, DOMElement, DOMText } from '../types';

// ---------------------------------------------------------------------------
// Internal htmlparser2 node shape (loosely typed to avoid coupling)
// ---------------------------------------------------------------------------

interface HP2Node {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: HP2Node[];
}

// Tags whose content should never appear in the rendered output.
const IGNORED_TAGS = new Set(['script', 'style', 'head', 'meta', 'link']);

/** Max depth to prevent stack overflow from deeply nested HTML. */
const MAX_DEPTH = 100;

function convertNode(
  node: HP2Node,
  ignoredTags: Set<string>,
  depth: number
): DOMNode | null {
  if (depth > MAX_DEPTH) return null;

  if (node.type === 'text') {
    const data = node.data ?? '';
    if (data.trim().length === 0) return null;
    return { type: 'text', data } satisfies DOMText;
  }

  if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
    const tag = (node.name ?? '').toLowerCase();

    // Skip built-in ignored tags AND user-supplied ignored tags
    if (IGNORED_TAGS.has(tag) || ignoredTags.has(tag)) {
      return null;
    }

    const children: DOMNode[] = [];
    for (const child of node.children ?? []) {
      const converted = convertNode(child, ignoredTags, depth + 1);
      if (converted) children.push(converted);
    }

    return {
      type: 'element',
      tag,
      attributes: node.attribs ?? {},
      children,
    } satisfies DOMElement;
  }

  return null;
}

/**
 * Parse an HTML string into an array of `DOMNode` objects.
 *
 * @param html - Raw HTML string.
 * @param ignoredTags - Optional set of tag names to skip entirely.
 * @returns Array of parsed DOM nodes.
 */
export function parseHTML(
  html: string,
  ignoredTags: Set<string> = new Set()
): DOMNode[] {
  const doc = parseDocument(html);
  const nodes: DOMNode[] = [];

  for (const child of (doc.children ?? []) as HP2Node[]) {
    const converted = convertNode(child, ignoredTags, 0);
    if (converted) nodes.push(converted);
  }

  return nodes;
}
