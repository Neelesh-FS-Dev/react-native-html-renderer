import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getCachedImageDimensions,
  setCachedImageDimensions,
  clearImageDimensionCache,
  getCachedDOM,
  setCachedDOM,
  clearDOMCache,
  buildDOMCacheKey,
} from '../utils/cache';
import type { DOMNode } from '../types';

describe('Image dimension cache', () => {
  beforeEach(() => {
    clearImageDimensionCache();
  });

  it('returns undefined for uncached URI', () => {
    expect(
      getCachedImageDimensions('https://example.com/img.png')
    ).toBeUndefined();
  });

  it('stores and retrieves dimensions', () => {
    setCachedImageDimensions('https://example.com/img.png', {
      width: 800,
      height: 600,
    });
    expect(getCachedImageDimensions('https://example.com/img.png')).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('clears the cache', () => {
    setCachedImageDimensions('a.png', { width: 1, height: 1 });
    clearImageDimensionCache();
    expect(getCachedImageDimensions('a.png')).toBeUndefined();
  });

  it('evicts oldest entry when at max size (200)', () => {
    for (let i = 0; i < 200; i++) {
      setCachedImageDimensions(`img-${i}.png`, { width: i, height: i });
    }
    // Add one more — should evict the first
    setCachedImageDimensions('img-200.png', { width: 200, height: 200 });
    expect(getCachedImageDimensions('img-0.png')).toBeUndefined();
    expect(getCachedImageDimensions('img-200.png')).toBeDefined();
  });
});

describe('DOM cache', () => {
  beforeEach(() => {
    clearDOMCache();
  });

  it('returns undefined for uncached key', () => {
    const key = buildDOMCacheKey('<p>test</p>', false, new Set());
    expect(getCachedDOM(key)).toBeUndefined();
  });

  it('stores and retrieves parsed DOM', () => {
    const nodes: DOMNode[] = [
      {
        type: 'element',
        tag: 'p',
        attributes: {},
        children: [{ type: 'text', data: 'hi' }],
      },
    ];
    const key = buildDOMCacheKey('<p>hi</p>', false, new Set());
    setCachedDOM(key, nodes);
    expect(getCachedDOM(key)).toBe(nodes);
  });

  it('clears the cache', () => {
    const nodes: DOMNode[] = [{ type: 'text', data: 'x' }];
    const key = buildDOMCacheKey('x', false, new Set());
    setCachedDOM(key, nodes);
    clearDOMCache();
    expect(getCachedDOM(key)).toBeUndefined();
  });

  it('evicts oldest entry when at capacity', () => {
    for (let i = 0; i < 50; i++) {
      const key = buildDOMCacheKey(`html-${i}`, false, new Set());
      setCachedDOM(key, [{ type: 'text', data: `${i}` }]);
    }
    const key51 = buildDOMCacheKey('html-50', false, new Set());
    setCachedDOM(key51, [{ type: 'text', data: '50' }]);

    const key0 = buildDOMCacheKey('html-0', false, new Set());
    const key1 = buildDOMCacheKey('html-1', false, new Set());
    expect(getCachedDOM(key0)).toBeUndefined();
    expect(getCachedDOM(key51)).toBeDefined();
    expect(getCachedDOM(key1)).toBeDefined();
  });
});

describe('buildDOMCacheKey — prevents cache poisoning', () => {
  it('produces different keys for same HTML with different allowDangerousHtml', () => {
    const key1 = buildDOMCacheKey('<p>x</p>', false, new Set());
    const key2 = buildDOMCacheKey('<p>x</p>', true, new Set());
    expect(key1).not.toBe(key2);
  });

  it('produces different keys for same HTML with different ignoredTags', () => {
    const key1 = buildDOMCacheKey('<p>x</p>', false, new Set());
    const key2 = buildDOMCacheKey('<p>x</p>', false, new Set(['div']));
    expect(key1).not.toBe(key2);
  });

  it('produces same key for same params regardless of ignoredTags insertion order', () => {
    const key1 = buildDOMCacheKey('<p>x</p>', false, new Set(['a', 'b']));
    const key2 = buildDOMCacheKey('<p>x</p>', false, new Set(['b', 'a']));
    expect(key1).toBe(key2);
  });

  it('same HTML + same params = same key (cache hit)', () => {
    const key1 = buildDOMCacheKey('<p>x</p>', false, new Set(['div']));
    const key2 = buildDOMCacheKey('<p>x</p>', false, new Set(['div']));
    expect(key1).toBe(key2);
  });
});
