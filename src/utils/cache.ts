import { Image } from 'react-native';
import type { DOMNode, PersistentCacheAdapter } from '../types';

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

// ---------------------------------------------------------------------------
// Persistent cache adapter (user-provided AsyncStorage/MMKV)
// ---------------------------------------------------------------------------

const PERSIST_PREFIX = '@rnhr:';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

let persistAdapter: PersistentCacheAdapter | null = null;
let persistTTL = DEFAULT_TTL_MS;

/** Install a persistent cache adapter (AsyncStorage-compatible). */
export function configurePersistentCache(
  adapter: PersistentCacheAdapter | null,
  ttlMs?: number
): void {
  persistAdapter = adapter;
  if (ttlMs && ttlMs > 0) persistTTL = ttlMs;
}

interface PersistEntry<T> {
  v: T;
  e: number; // epoch ms when this entry expires
}

async function persistGet<T>(key: string): Promise<T | null> {
  if (!persistAdapter) return null;
  try {
    const raw = await Promise.resolve(
      persistAdapter.getItem(PERSIST_PREFIX + key)
    );
    if (!raw) return null;
    const parsed: PersistEntry<T> = JSON.parse(raw);
    if (Date.now() > parsed.e) {
      await Promise.resolve(persistAdapter.removeItem(PERSIST_PREFIX + key));
      return null;
    }
    return parsed.v;
  } catch {
    return null;
  }
}

async function persistSet<T>(key: string, value: T): Promise<void> {
  if (!persistAdapter) return;
  try {
    const entry: PersistEntry<T> = { v: value, e: Date.now() + persistTTL };
    await Promise.resolve(
      persistAdapter.setItem(PERSIST_PREFIX + key, JSON.stringify(entry))
    );
  } catch {
    // ignore persistent cache write errors
  }
}

/** Load a persisted DOM entry into the in-memory LRU (best-effort, async). */
export async function hydrateDOMCache(
  cacheKey: string
): Promise<DOMNode[] | null> {
  const cached = getCachedDOM(cacheKey);
  if (cached) return cached;
  const loaded = await persistGet<DOMNode[]>('dom:' + cacheKey);
  if (loaded) setCachedDOM(cacheKey, loaded);
  return loaded;
}

/** Write a DOM entry to the persistent adapter (fire-and-forget). */
export function persistDOM(cacheKey: string, nodes: DOMNode[]): void {
  persistSet('dom:' + cacheKey, nodes);
}

/** Preload HTML into the in-memory and persistent caches. */
export async function preloadHtml(
  html: string,
  options: {
    allowDangerousHtml?: boolean;
    ignoredTags?: Set<string>;
  } = {}
): Promise<void> {
  const { parseHTML } = await import('../parser');
  const ignored = options.ignoredTags ?? new Set<string>();
  const key = buildDOMCacheKey(
    html,
    options.allowDangerousHtml ?? false,
    ignored
  );
  let parsed = getCachedDOM(key);
  if (!parsed) {
    parsed = parseHTML(html, ignored);
    setCachedDOM(key, parsed);
  }
  if (persistAdapter) persistDOM(key, parsed);
}

/** Preload a batch of image URLs — resolves their dimensions upfront. */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(
      (uri) =>
        new Promise<void>((resolve) => {
          if (getCachedImageDimensions(uri)) return resolve();
          Image.getSize(
            uri,
            (w, h) => {
              setCachedImageDimensions(uri, { width: w, height: h });
              resolve();
            },
            () => resolve()
          );
        })
    )
  );
}

/** Clear both in-memory and persistent caches. */
export async function clearAllCaches(): Promise<void> {
  clearImageDimensionCache();
  clearDOMCache();
  if (persistAdapter?.clear) {
    await Promise.resolve(persistAdapter.clear());
  }
}
