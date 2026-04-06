import type { DOMNode, DOMElement } from '../types';

/** Tags considered dangerous and stripped when `allowDangerousHtml` is false. */
const DANGEROUS_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'applet',
  'base',
  'svg',
  'math',
  'frame',
  'frameset',
  'template',
  'noscript',
]);

/** Attributes that carry URLs and must be checked for dangerous schemes. */
const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'srcset',
  'poster',
  'action',
  'formaction',
  'data',
  'background',
  'xlink:href',
  'srcdoc',
]);

/** Attribute keys that should never be copied to the output. */
const BLOCKED_ATTR_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Allowed URL schemes for links and resources. Everything else is blocked. */
const SAFE_SCHEMES = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'sms:',
  'geo:',
  'data:image/', // only data: images are safe
]);

/** Max recursion depth for sanitizing nested DOM trees. */
const MAX_DEPTH = 100;

/**
 * Strip ASCII control characters (0x00–0x1F), tabs, newlines, and carriage
 * returns from a string before checking schemes. This prevents bypass via
 * null-byte injection or embedded whitespace (e.g. `java\tscript:`).
 */
function normalizeUrl(url: string): string {
  return url
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Returns true if the URL uses a safe, allowed scheme.
 * Blocks `javascript:`, `vbscript:`, `data:text/*`, and any other unknown scheme.
 */
function isSafeUrl(url: string): boolean {
  const normalized = normalizeUrl(url);

  // Relative URLs and fragment-only URLs are safe
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('?') ||
    !normalized.includes(':')
  ) {
    return true;
  }

  // Check against allowed schemes
  for (const scheme of SAFE_SCHEMES) {
    if (normalized.startsWith(scheme)) return true;
  }

  return false;
}

/**
 * Recursively sanitize a DOM tree:
 * - Remove dangerous tags entirely (including children)
 * - Strip ALL event handler attributes (any attribute starting with `on`)
 * - Neutralize dangerous URLs in all URL-bearing attributes
 * - Guard against prototype pollution via attribute keys
 * - Enforce a max recursion depth to prevent stack overflow
 */
export function sanitizeDOM(nodes: DOMNode[], depth: number = 0): DOMNode[] {
  if (depth > MAX_DEPTH) return [];

  const result: DOMNode[] = [];

  for (const node of nodes) {
    if (node.type === 'text') {
      result.push(node);
      continue;
    }

    // Strip dangerous tags entirely (including children)
    if (DANGEROUS_TAGS.has(node.tag)) {
      continue;
    }

    // Clean attributes
    const cleanAttrs = Object.create(null) as Record<string, string>;

    for (const [key, value] of Object.entries(node.attributes)) {
      const keyLower = key.toLowerCase();

      // Strip event handlers (any attribute starting with "on")
      if (keyLower.startsWith('on')) continue;

      // Guard against prototype pollution
      if (BLOCKED_ATTR_KEYS.has(keyLower)) continue;

      // Sanitize URL-bearing attributes
      if (URL_ATTRIBUTES.has(keyLower)) {
        if (!isSafeUrl(value)) {
          // For href, replace with #; for others, drop entirely
          if (keyLower === 'href') {
            cleanAttrs[key] = '#';
          }
          continue;
        }
      }

      cleanAttrs[key] = value;
    }

    const sanitizedElement: DOMElement = {
      type: 'element',
      tag: node.tag,
      attributes: cleanAttrs,
      children: sanitizeDOM(node.children, depth + 1),
    };

    result.push(sanitizedElement);
  }

  return result;
}
