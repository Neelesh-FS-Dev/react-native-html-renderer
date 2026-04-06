// Main component
export { HtmlRenderer } from './HtmlRenderer';

// Parser
export { parseHTML } from './parser';

// Styles
export {
  parseInlineStyle,
  getDefaultTagStyles,
  getDefaultDarkModeStyles,
} from './styles';

// Hooks
export { useHtmlParser, useContentWidth, useTagStyle } from './hooks';

// Context (for advanced use inside custom renderers)
export { useHtmlRendererContext } from './context';

// Utilities
export { sanitizeDOM } from './utils/sanitize';
export { clearImageDimensionCache, clearDOMCache } from './utils/cache';

// Types
export type {
  HtmlRendererProps,
  DOMNode,
  DOMElement,
  DOMText,
  RNStyle,
  CustomRenderer,
  CustomRendererProps,
  TagsStyles,
  ClassesStyles,
  IdsStyles,
  HtmlRendererContextValue,
  ListPrefixRendererProps,
  ListsPrefixesRenderers,
} from './types';
