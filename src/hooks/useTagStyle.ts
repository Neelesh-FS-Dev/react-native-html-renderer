import { useMemo } from 'react';
import { useHtmlRendererContext } from '../context';
import { getDefaultTagStyles } from '../styles';
import type { RNStyle } from '../types';

/**
 * Returns the fully merged style for a given HTML tag, combining:
 * default tag styles → user `tagsStyles` override.
 *
 * Useful inside custom renderers that want access to the computed base style.
 *
 * @param tag - The HTML tag name (e.g. `'p'`, `'h1'`).
 */
export function useTagStyle(tag: string): RNStyle {
  const ctx = useHtmlRendererContext();

  return useMemo(() => {
    const defaults = getDefaultTagStyles(ctx.emSize);
    const base = defaults[tag] ?? {};
    const override = ctx.tagsStyles[tag] ?? {};
    return { ...base, ...override } as RNStyle;
  }, [tag, ctx.emSize, ctx.tagsStyles]);
}
