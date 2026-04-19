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
export { resolveMediaQueries } from './styles/mediaQueries';
export { resolveGridLayout } from './styles/grid';

// Hooks
export {
  useHtmlParser,
  useContentWidth,
  useTagStyle,
  useFormState,
} from './hooks';

// Context (for advanced use inside custom renderers)
export { useHtmlRendererContext } from './context';

// Utilities
export { sanitizeDOM } from './utils/sanitize';
export {
  clearImageDimensionCache,
  clearDOMCache,
  configurePersistentCache,
  hydrateDOMCache,
  persistDOM,
  preloadHtml,
  preloadImages,
  clearAllCaches,
} from './utils/cache';
export {
  extractLinks,
  extractImages,
  htmlToText,
  generateTOC,
} from './utils/extractors';
export type {
  ExtractedLink,
  ExtractedImage,
  TOCEntry,
} from './utils/extractors';
export { markdownToHtml } from './utils/markdown';
export { detectDirection, detectLocale, formatNumber } from './utils/i18n';

// Plugin system
export {
  registerRenderer,
  unregisterRenderer,
  installPlugin,
  uninstallPlugin,
  getGlobalRenderers,
  clearPluginRegistry,
} from './plugins';

// Dev tools
export {
  inspectTree,
  formatInspectorTree,
  profile,
  accessibilityAudit,
} from './devtools';
export type { InspectorNode, PerfSample, A11yWarning } from './devtools';

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
  FormFieldState,
  FormState,
  OnFormChange,
  RendererPlugin,
  PersistentCacheAdapter,
  MediaQueryBreakpoint,
  RenderMetrics,
  OnMeasureCallback,
  I18nOptions,
} from './types';
