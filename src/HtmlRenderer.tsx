import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  View,
  useColorScheme,
  type LayoutChangeEvent,
} from 'react-native';
import type {
  HtmlRendererProps,
  HtmlRendererContextValue,
  TagsStyles,
  ClassesStyles,
  IdsStyles,
} from './types';
import { HtmlRendererContext } from './context';
import { parseHTML } from './parser';
import { getDefaultDarkModeStyles } from './styles/darkModeStyles';
import { resolveMediaQueries } from './styles/mediaQueries';
import { renderNodes } from './renderer';
import { ErrorBoundary } from './renderer/ErrorBoundary';
import { sanitizeDOM } from './utils/sanitize';
import {
  getCachedDOM,
  setCachedDOM,
  buildDOMCacheKey,
  configurePersistentCache,
  persistDOM,
} from './utils/cache';
import { detectDirection, detectLocale } from './utils/i18n';
import { getGlobalRenderers } from './plugins';
import { useFormState } from './hooks/useFormState';

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
  onBeforeRender,
  onAfterRender,
  onMeasure,
  virtualized = false,
  lazyLoadImages = false,
  initialFormState,
  onFormChange,
  plugins,
  persistentCache,
  persistentCacheTTL,
  mediaQueries,
  i18n,
  videoRenderer,
  audioRenderer,
  svgRenderer,
}: HtmlRendererProps) {
  // --- Persistent cache config ---
  useEffect(() => {
    if (persistentCache) {
      configurePersistentCache(persistentCache, persistentCacheTTL);
    }
  }, [persistentCache, persistentCacheTTL]);

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

  // --- Install per-instance plugins ---
  const pluginRenderers = useMemo(() => {
    const merged: Record<string, ReturnType<typeof Function> | Function> = {};
    if (plugins) {
      for (const p of plugins) {
        if (p.renderers) Object.assign(merged, p.renderers);
      }
    }
    return merged as Record<string, any>;
  }, [plugins]);

  // --- Parse DOM + track parse duration ---
  const parseMetricsRef = useRef<{ durationMs: number }>({ durationMs: 0 });
  const nodes = useMemo(() => {
    try {
      const start = now();
      const cacheKey = buildDOMCacheKey(
        html,
        allowDangerousHtml,
        ignoredTagsSet
      );
      const cached = getCachedDOM(cacheKey);
      if (cached) {
        parseMetricsRef.current.durationMs = now() - start;
        return cached;
      }

      let parsed = parseHTML(html, ignoredTagsSet);
      if (!allowDangerousHtml) parsed = sanitizeDOM(parsed);

      setCachedDOM(cacheKey, parsed);
      persistDOM(cacheKey, parsed);
      parseMetricsRef.current.durationMs = now() - start;
      return parsed;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to parse HTML');
      if (debug) console.error('[HtmlRenderer] Parse error:', error);
      onError?.(error);
      return [];
    }
  }, [html, ignoredTagsSet, allowDangerousHtml, debug, onError]);

  // --- Resolve i18n ---
  const writingDirection = useMemo(
    () => detectDirection(nodes, i18n),
    [nodes, i18n]
  );
  const locale = useMemo(() => detectLocale(nodes, i18n), [nodes, i18n]);

  // --- Media queries + dark mode merge ---
  const mediaResolved = useMemo(
    () => resolveMediaQueries(mediaQueries, contentWidth),
    [mediaQueries, contentWidth]
  );

  const effectiveTagsStyles: TagsStyles = useMemo(() => {
    const base: TagsStyles = { ...(tagsStyles ?? {}) };
    // media queries tags
    for (const [tag, s] of Object.entries(mediaResolved.tagsStyles)) {
      base[tag] = { ...(base[tag] ?? {}), ...s };
    }
    if (!isDark) return base;
    const defaultDark = getDefaultDarkModeStyles();
    const userDark = darkModeStyles ?? {};
    const merged: TagsStyles = { ...base };
    for (const tag of Object.keys(defaultDark)) {
      merged[tag] = { ...(merged[tag] ?? {}), ...defaultDark[tag] };
    }
    for (const tag of Object.keys(userDark)) {
      merged[tag] = { ...(merged[tag] ?? {}), ...userDark[tag] };
    }
    return merged;
  }, [tagsStyles, isDark, darkModeStyles, mediaResolved]);

  const effectiveClassesStyles: ClassesStyles = useMemo(() => {
    const base: ClassesStyles = { ...(classesStyles ?? {}) };
    for (const [k, s] of Object.entries(mediaResolved.classesStyles)) {
      base[k] = { ...(base[k] ?? {}), ...s };
    }
    return base;
  }, [classesStyles, mediaResolved]);

  const effectiveIdsStyles: IdsStyles = useMemo(() => {
    const base: IdsStyles = { ...(idsStyles ?? {}) };
    for (const [k, s] of Object.entries(mediaResolved.idsStyles)) {
      base[k] = { ...(base[k] ?? {}), ...s };
    }
    return base;
  }, [idsStyles, mediaResolved]);

  // --- Merged renderers: globalRegistry < plugins < per-instance ---
  const mergedRenderers = useMemo(() => {
    return {
      ...getGlobalRenderers(),
      ...pluginRenderers,
      ...(customRenderers ?? {}),
    };
  }, [pluginRenderers, customRenderers]);

  // --- Form state ---
  const { state: formState, setField: setFormField } = useFormState(
    initialFormState,
    onFormChange
  );

  // --- Build context value ---
  const ctx: HtmlRendererContextValue = useMemo(
    () => ({
      contentWidth,
      tagsStyles: effectiveTagsStyles,
      classesStyles: effectiveClassesStyles,
      idsStyles: effectiveIdsStyles,
      customRenderers: mergedRenderers,
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
      lazyLoadImages,
      formState,
      setFormField,
      writingDirection,
      locale,
      videoRenderer,
      audioRenderer,
      svgRenderer,
    }),
    [
      contentWidth,
      effectiveTagsStyles,
      effectiveClassesStyles,
      effectiveIdsStyles,
      mergedRenderers,
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
      lazyLoadImages,
      formState,
      setFormField,
      writingDirection,
      locale,
      videoRenderer,
      audioRenderer,
      svgRenderer,
    ]
  );

  // --- Debug log ---
  if (debug) {
    console.log('[HtmlRenderer] Parsed DOM:', JSON.stringify(nodes, null, 2));
    console.log('[HtmlRenderer] Color scheme:', resolvedScheme);
    console.log('[HtmlRenderer] Writing direction:', writingDirection);
    console.log('[HtmlRenderer] Locale:', locale);
  }

  // --- onBeforeRender lifecycle ---
  useEffect(() => {
    if (nodes.length > 0) onBeforeRender?.(nodes);
  }, [nodes, onBeforeRender]);

  // --- Render + track metrics ---
  const renderedMetricsRef = useRef<{ renderMs: number }>({ renderMs: 0 });
  const rendered = useMemo(() => {
    try {
      const start = now();
      const result = renderNodes(nodes, ctx, 'rn');
      renderedMetricsRef.current.renderMs = now() - start;
      return result;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to render HTML');
      if (debug) console.error('[HtmlRenderer] Render error:', error);
      onError?.(error);
      return [];
    }
  }, [nodes, ctx, debug, onError]);

  // --- onAfterRender lifecycle ---
  useEffect(() => {
    onAfterRender?.({
      nodeCount: nodes.length,
      durationMs:
        parseMetricsRef.current.durationMs +
        renderedMetricsRef.current.renderMs,
      parseDurationMs: parseMetricsRef.current.durationMs,
    });
  }, [rendered, onAfterRender, nodes.length]);

  // --- onMeasure layout handler ---
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      onMeasure?.(e.nativeEvent.layout);
    },
    [onMeasure]
  );

  const rootStyle = [
    containerStyle,
    writingDirection === 'rtl' && { direction: 'rtl' as const },
    baseStyle,
  ];

  return (
    <ErrorBoundary onError={onError} fallback={fallback}>
      <HtmlRendererContext.Provider value={ctx}>
        {virtualized ? (
          <FlatList
            data={rendered}
            keyExtractor={(_, i) => `vrn_${i}`}
            renderItem={({ item }) => <>{item}</>}
            onLayout={onMeasure ? onLayout : undefined}
            style={rootStyle}
            initialNumToRender={10}
            windowSize={5}
          />
        ) : (
          <View style={rootStyle} onLayout={onMeasure ? onLayout : undefined}>
            {rendered}
          </View>
        )}
      </HtmlRendererContext.Provider>
    </ErrorBoundary>
  );
}

const containerStyle = { flexShrink: 1 as const };

function now(): number {
  const g = globalThis as { performance?: { now?: () => number } };
  return g.performance?.now ? g.performance.now() : Date.now();
}
