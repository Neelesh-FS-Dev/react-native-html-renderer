import { createContext, useContext } from 'react';
import type { HtmlRendererContextValue } from '../types';

const DEFAULT_CONTEXT: HtmlRendererContextValue = {
  contentWidth: 300,
  tagsStyles: {},
  classesStyles: {},
  idsStyles: {},
  customRenderers: {},
  renderersProps: {},
  emSize: 14,
  debug: false,
  ignoredTags: new Set(),
  ignoredStyles: new Set(),
  allowedStyles: null,
  imagesInitialDimensions: { width: 100, height: 100 },
  nestLevel: 0,
  colorScheme: 'light',
  darkModeStyles: {},
  allowFontScaling: true,
  maxFontSizeMultiplier: undefined,
};

export const HtmlRendererContext =
  createContext<HtmlRendererContextValue>(DEFAULT_CONTEXT);

/** Access the HtmlRenderer context from inside the render tree. */
export function useHtmlRendererContext(): HtmlRendererContextValue {
  return useContext(HtmlRendererContext);
}
