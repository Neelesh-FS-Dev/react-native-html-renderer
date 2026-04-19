import type { DOMNode, DOMElement } from '../types';

// Re-export sub-modules
export { sanitizeDOM } from './sanitize';
export {
  getAccessibilityProps,
  getImageA11yLabel,
  getLinkA11yLabel,
  type A11yProps,
} from './accessibility';
export {
  getCachedImageDimensions,
  setCachedImageDimensions,
  clearImageDimensionCache,
  getCachedDOM,
  setCachedDOM,
  clearDOMCache,
  buildDOMCacheKey,
  configurePersistentCache,
  hydrateDOMCache,
  persistDOM,
  preloadHtml,
  preloadImages,
  clearAllCaches,
} from './cache';
export {
  extractLinks,
  extractImages,
  htmlToText,
  generateTOC,
  type ExtractedLink,
  type ExtractedImage,
  type TOCEntry,
} from './extractors';
export { markdownToHtml } from './markdown';
export { detectDirection, detectLocale, formatNumber } from './i18n';

// ---------------------------------------------------------------------------
// CSS unit conversion
// ---------------------------------------------------------------------------

/**
 * Convert a CSS value string to a numeric pixel value.
 * Supports: px, em, rem, bare numbers. Percentage returns NaN (handled upstream).
 */
export function cssValueToNumeric(
  value: string,
  emSize: number
): number | undefined {
  const trimmed = value.trim();
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith('em') || trimmed.endsWith('rem')) {
    return parseFloat(trimmed) * emSize;
  }
  if (trimmed.endsWith('%')) {
    // Percentage — return undefined, caller must handle contextually
    return undefined;
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? undefined : num;
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/** Tags that are inherently inline (text-level). */
export const INLINE_TAGS = new Set([
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'ins',
  'mark',
  'small',
  'sub',
  'sup',
  'a',
  'code',
  'br',
]);

/** Tags that are text containers (rendered as `<Text>` at block level). */
export const TEXT_BLOCK_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'th',
  'td',
  'pre',
  'label',
  'dt',
  'dd',
]);

/** Tags that should be silently skipped (no output). */
export const ALWAYS_IGNORED_TAGS = new Set([
  'script',
  'style',
  'head',
  'meta',
  'link',
  'title',
  'noscript',
]);

/**
 * Returns true if every child of the given list is either a text node
 * or an inline-level element whose descendants are also all inline.
 */
export function isInlineContent(nodes: DOMNode[]): boolean {
  return nodes.every((node) => {
    if (node.type === 'text') return true;
    if (node.type === 'element') {
      return INLINE_TAGS.has(node.tag) && isInlineContent(node.children);
    }
    return false;
  });
}

/**
 * Resolve a potentially relative URL against a base URL.
 */
export function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl || /^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  return url.startsWith('/') ? base + url.slice(1) : base + url;
}

/**
 * Type-guard: checks if a DOMNode is a DOMElement.
 */
export function isDOMElement(node: DOMNode): node is DOMElement {
  return node.type === 'element';
}

/**
 * Extract all text content from a node tree (for accessibility labels, etc.).
 */
export function extractTextContent(nodes: DOMNode[]): string {
  let text = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      text += node.data;
    } else if (node.type === 'element') {
      if (node.tag === 'br') {
        text += '\n';
      } else {
        text += extractTextContent(node.children);
      }
    }
  }
  return text;
}
