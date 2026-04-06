import { useMemo } from 'react';
import { parseHTML } from '../parser';
import type { DOMNode } from '../types';

/**
 * Hook that parses an HTML string into a DOM tree.
 * The result is memoized and only recomputed when `html` or `ignoredTags` change.
 *
 * @param html - Raw HTML string.
 * @param ignoredTags - Optional set of tag names to skip.
 * @returns Array of parsed DOMNode objects.
 */
export function useHtmlParser(
  html: string,
  ignoredTags?: Set<string>
): DOMNode[] {
  return useMemo(() => parseHTML(html, ignoredTags), [html, ignoredTags]);
}
