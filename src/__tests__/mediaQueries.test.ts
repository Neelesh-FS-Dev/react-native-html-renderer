import { describe, it, expect } from '@jest/globals';
import { resolveMediaQueries } from '../styles/mediaQueries';

describe('resolveMediaQueries', () => {
  it('returns empty when no breakpoints', () => {
    const out = resolveMediaQueries(undefined, 500);
    expect(out.tagsStyles).toEqual({});
  });

  it('applies matching min/max width', () => {
    const out = resolveMediaQueries(
      [
        { maxWidth: 600, tagsStyles: { h1: { fontSize: 20 } } },
        { minWidth: 601, tagsStyles: { h1: { fontSize: 40 } } },
      ],
      500
    );
    expect(out.tagsStyles.h1).toEqual({ fontSize: 20 });
  });

  it('cascades breakpoints in order', () => {
    const out = resolveMediaQueries(
      [
        { maxWidth: 1000, tagsStyles: { p: { color: 'red' } } },
        { maxWidth: 1000, tagsStyles: { p: { fontSize: 14 } } },
      ],
      500
    );
    expect(out.tagsStyles.p).toEqual({ color: 'red', fontSize: 14 });
  });
});
