import { useMemo } from 'react';
import { View, useColorScheme } from 'react-native';
import type {
  HtmlRendererProps,
  HtmlRendererContextValue,
  TagsStyles,
} from './types';
import { HtmlRendererContext } from './context';
import { parseHTML } from './parser';
import { getDefaultDarkModeStyles } from './styles/darkModeStyles';
import { renderNodes } from './renderer';
import { ErrorBoundary } from './renderer/ErrorBoundary';
import { sanitizeDOM } from './utils/sanitize';
import { getCachedDOM, setCachedDOM, buildDOMCacheKey } from './utils/cache';

/**
 * Renders an HTML string into native React Native components.
 *
 * @example
 * ```tsx
 * <HtmlRenderer
 *   html="<h1>Hello</h1><p>World</p>"
 *   contentWidth={350}
 *   onLinkPress={(href) => Linking.openURL(href)}
 * />
 * ```
 */
export function HtmlRenderer({
  html,
  contentWidth,
  baseStyle,
  tagsStyles,
  classesStyles,
  idsStyles,
  customRenderers,
  onLinkPress,
  onImagePress,
  onError,
  fallback,
  ignoredTags,
  ignoredStyles,
  allowedStyles,
  defaultTextProps,
  defaultViewProps,
  renderersProps,
  maxImagesWidth,
  imagesInitialDimensions,
  listsPrefixesRenderers,
  emSize = 14,
  systemFonts,
  fallbackFonts,
  debug = false,
  allowDangerousHtml = false,
  darkModeStyles,
  colorScheme: colorSchemeProp,
  allowFontScaling = true,
  maxFontSizeMultiplier,
}: HtmlRendererProps) {
  // --- Color scheme ---
  const systemScheme = useColorScheme();
  const resolvedScheme = colorSchemeProp ?? systemScheme;
  const isDark = resolvedScheme === 'dark';

  // --- Memoize set conversions ---
  const ignoredTagsSet = useMemo(
    () => new Set(ignoredTags ?? []),
    [ignoredTags]
  );
  const ignoredStylesSet = useMemo(
    () => new Set(ignoredStyles ?? []),
    [ignoredStyles]
  );
  const allowedStylesSet = useMemo(
    () => (allowedStyles ? new Set(allowedStyles) : null),
    [allowedStyles]
  );

  // --- Parse DOM (with cache, key includes sanitization params to prevent poisoning) ---
  const nodes = useMemo(() => {
    try {
      const cacheKey = buildDOMCacheKey(
        html,
        allowDangerousHtml,
        ignoredTagsSet
      );
      const cached = getCachedDOM(cacheKey);
      if (cached) return cached;

      let parsed = parseHTML(html, ignoredTagsSet);

      // Sanitize if not explicitly opted out
      if (!allowDangerousHtml) {
        parsed = sanitizeDOM(parsed);
      }

      setCachedDOM(cacheKey, parsed);
      return parsed;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to parse HTML');
      if (debug) {
        console.error('[HtmlRenderer] Parse error:', error);
      }
      onError?.(error);
      return [];
    }
  }, [html, ignoredTagsSet, allowDangerousHtml, debug, onError]);

  // --- Merge dark mode styles ---
  const effectiveTagsStyles: TagsStyles = useMemo(() => {
    const base = tagsStyles ?? {};
    if (!isDark) return base;

    const defaultDark = getDefaultDarkModeStyles();
    const userDark = darkModeStyles ?? {};

    // Merge: base tagsStyles + default dark overrides + user dark overrides
    const merged: TagsStyles = { ...base };
    for (const tag of Object.keys(defaultDark)) {
      merged[tag] = { ...(merged[tag] ?? {}), ...defaultDark[tag] };
    }
    for (const tag of Object.keys(userDark)) {
      merged[tag] = { ...(merged[tag] ?? {}), ...userDark[tag] };
    }
    return merged;
  }, [tagsStyles, isDark, darkModeStyles]);

  // --- Build context value ---
  const ctx: HtmlRendererContextValue = useMemo(
    () => ({
      contentWidth,
      tagsStyles: effectiveTagsStyles,
      classesStyles: classesStyles ?? {},
      idsStyles: idsStyles ?? {},
      customRenderers: customRenderers ?? {},
      onLinkPress,
      onImagePress,
      renderersProps: renderersProps ?? {},
      emSize,
      debug,
      ignoredTags: ignoredTagsSet,
      ignoredStyles: ignoredStylesSet,
      allowedStyles: allowedStylesSet,
      defaultTextProps,
      defaultViewProps,
      maxImagesWidth,
      imagesInitialDimensions: imagesInitialDimensions ?? {
        width: 100,
        height: 100,
      },
      listsPrefixesRenderers,
      systemFonts,
      fallbackFonts,
      nestLevel: 0,
      colorScheme: resolvedScheme,
      darkModeStyles: darkModeStyles ?? {},
      allowFontScaling,
      maxFontSizeMultiplier,
    }),
    [
      contentWidth,
      effectiveTagsStyles,
      classesStyles,
      idsStyles,
      customRenderers,
      onLinkPress,
      onImagePress,
      renderersProps,
      emSize,
      debug,
      ignoredTagsSet,
      ignoredStylesSet,
      allowedStylesSet,
      defaultTextProps,
      defaultViewProps,
      maxImagesWidth,
      imagesInitialDimensions,
      listsPrefixesRenderers,
      systemFonts,
      fallbackFonts,
      resolvedScheme,
      darkModeStyles,
      allowFontScaling,
      maxFontSizeMultiplier,
    ]
  );

  // --- Debug log ---
  if (debug) {
    console.log('[HtmlRenderer] Parsed DOM:', JSON.stringify(nodes, null, 2));
    console.log('[HtmlRenderer] Color scheme:', resolvedScheme);
  }

  // --- Render ---
  const rendered = useMemo(() => {
    try {
      return renderNodes(nodes, ctx, 'rn');
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to render HTML');
      if (debug) {
        console.error('[HtmlRenderer] Render error:', error);
      }
      onError?.(error);
      return [];
    }
  }, [nodes, ctx, debug, onError]);

  return (
    <ErrorBoundary onError={onError} fallback={fallback}>
      <HtmlRendererContext.Provider value={ctx}>
        <View style={[containerStyle, baseStyle]}>{rendered}</View>
      </HtmlRendererContext.Provider>
    </ErrorBoundary>
  );
}

const containerStyle = { flexShrink: 1 as const };
