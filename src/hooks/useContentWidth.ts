import { useHtmlRendererContext } from '../context';

/**
 * Returns the current `contentWidth` from the HtmlRenderer context.
 * Useful inside custom renderers that need to know the available layout width.
 */
export function useContentWidth(): number {
  return useHtmlRendererContext().contentWidth;
}
