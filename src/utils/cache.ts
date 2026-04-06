import type { DOMNode } from '../types';

// ---------------------------------------------------------------------------
// Image Dimension Cache (LRU, bounded)
// ---------------------------------------------------------------------------

interface ImageDimensions {
  width: number;
  height: number;
}

const imageDimensionCache = new Map<string, ImageDimensions>();
const IMAGE_CACHE_MAX_SIZE = 200;

/** Get cached image dimensions for a URL. */
export function getCachedImageDimensions(
  uri: string
): ImageDimensions | undefined {
  return imageDimensionCache.get(uri);
}

/** Cache image dimensions for a URL. */
export function setCachedImageDimensions(
  uri: string,
  dimensions: ImageDimensions
): void {
  if (imageDimensionCache.size >= IMAGE_CACHE_MAX_SIZE) {
    const firstKey = imageDimensionCache.keys().next().value;
    if (firstKey !== undefined) {
      imageDimensionCache.delete(firstKey);
    }
  }
  imageDimensionCache.set(uri, dimensions);
}

/** Clear the image dimension cache (useful for testing). */
export function clearImageDimensionCache(): void {
  imageDimensionCache.clear();
}

// ---------------------------------------------------------------------------
// Parsed DOM Cache (LRU, bounded)
// Cache key includes html + allowDangerousHtml + ignoredTags to prevent
// cache poisoning when these parameters change.
// ---------------------------------------------------------------------------

const domCache = new Map<string, DOMNode[]>();
const DOM_CACHE_MAX_SIZE = 50;

/**
 * Build a composite cache key that incorporates all parameters affecting
 * the parse/sanitize result, preventing cache poisoning.
 */
export function buildDOMCacheKey(
  html: string,
  allowDangerousHtml: boolean,
  ignoredTags: Set<string>
): string {
  const tagsSuffix =
    ignoredTags.size > 0 ? [...ignoredTags].sort().join(',') : '';
  return `${allowDangerousHtml ? '1' : '0'}|${tagsSuffix}|${html}`;
}

/** Get cached parsed DOM for a cache key. */
export function getCachedDOM(cacheKey: string): DOMNode[] | undefined {
  return domCache.get(cacheKey);
}

/** Cache parsed DOM for a cache key. */
export function setCachedDOM(cacheKey: string, nodes: DOMNode[]): void {
  if (domCache.size >= DOM_CACHE_MAX_SIZE) {
    const firstKey = domCache.keys().next().value;
    if (firstKey !== undefined) {
      domCache.delete(firstKey);
    }
  }
  domCache.set(cacheKey, nodes);
}

/** Clear the DOM cache (useful for testing). */
export function clearDOMCache(): void {
  domCache.clear();
}
