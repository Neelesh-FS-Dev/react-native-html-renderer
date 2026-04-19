# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-04-19

### Added

- **Interactive forms** — `<input>`, `<textarea>`, `<select>`, `<button>` are now toggleable/editable. `initialFormState` seeds values; `onFormChange(field, nextState)` fires on every change.
- **Plugin system** — global `registerRenderer`/`unregisterRenderer`/`installPlugin`/`uninstallPlugin`, plus a `plugins` prop for per-instance renderers.
- **Lifecycle callbacks** — `onBeforeRender(nodes)`, `onAfterRender({ nodeCount, durationMs, parseDurationMs })`, `onMeasure(layout)`.
- **Performance** — `virtualized` renders the top-level doc as a `FlatList`; `lazyLoadImages` defers off-screen image fetches.
- **Inline SVG** — built-in renderer for `rect`, `circle`, `ellipse`, `line`, `text`, `g`. Pass `svgRenderer` to delegate to `react-native-svg`.
- **Video/audio adapters** — `videoRenderer` / `audioRenderer` props wire in `expo-video`, `expo-av` or `react-native-video`.
- **CSS enhancements** — `mediaQueries` prop (min/max width breakpoints); inline CSS Grid simulation for `display:grid; grid-template-columns: repeat(N, 1fr)`.
- **i18n** — automatic RTL detection from `dir`/`lang`; `I18nOptions` prop; `detectDirection`, `detectLocale`, `formatNumber` helpers.
- **Utility functions** — `extractLinks`, `extractImages`, `htmlToText`, `generateTOC`, `markdownToHtml`.
- **Dev tools** — `inspectTree`, `formatInspectorTree`, `profile`, `accessibilityAudit`.
- **Advanced caching** — `configurePersistentCache` (AsyncStorage/MMKV-compatible adapter), `preloadHtml`, `preloadImages`, TTL, `clearAllCaches`, `hydrateDOMCache`.

### Changed

- Sanitizer no longer strips `<svg>` or `<form>` by default — their children are still sanitized recursively (nested `<script>` and `on*` handlers continue to be removed).
- `InputTag` / `TextareaTag` / `ButtonTag` / `SelectTag` are now interactive rather than read-only visual placeholders.

## [0.2.0] - 2026-04-06

### Added

- **Security**: Built-in XSS sanitization — strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>` tags; neutralizes `javascript:` / `vbscript:` / `data:text/html` hrefs; removes event handler attributes (`onclick`, `onerror`, etc.)
- **Security**: `allowDangerousHtml` prop (default `false`) to opt out of sanitization
- **Accessibility**: `aria-label`, `aria-hidden`, `aria-role`, `aria-disabled`, `aria-checked`, `aria-expanded`, `aria-busy` support on all elements
- **Accessibility**: Correct `accessibilityRole` mapping for links, buttons, images, headings, lists, checkboxes, radio buttons
- **Accessibility**: `accessibilityHint` on links showing the href
- **Accessibility**: `accessibilityLabel` derived from `alt`, `aria-label`, `title` attributes
- **Dark Mode**: Automatic system color scheme detection via `useColorScheme()`
- **Dark Mode**: `darkModeStyles` prop for per-tag dark mode overrides
- **Dark Mode**: `colorScheme` prop to override system detection
- **Dark Mode**: Built-in default dark mode styles for all text, code, table, form, and separator elements
- **Font Scaling**: `allowFontScaling` prop (default `true`) for system accessibility font scaling
- **Font Scaling**: `maxFontSizeMultiplier` prop to cap font scaling
- **Caching**: Parsed DOM cache (LRU, max 50 entries) to avoid re-parsing identical HTML
- **Caching**: Image dimension cache to avoid repeated `Image.getSize()` calls
- **Caching**: `clearDOMCache()` and `clearImageDimensionCache()` exports for manual cache control
- **Debug Mode**: Red border drawn around every rendered node when `debug={true}`
- **Debug Mode**: Unknown/unsupported tags logged as warnings
- **Debug Mode**: Color scheme logged to console
- **Infrastructure**: GitHub Actions CI workflow (lint, typecheck, test, build)
- **Infrastructure**: GitHub Actions npm publish workflow on release tags
- **Infrastructure**: Issue templates (bug report, feature request)
- **Infrastructure**: Pull request template
- **Infrastructure**: SECURITY.md with vulnerability disclosure policy
- **Infrastructure**: VS Code recommended extensions and settings
- **Infrastructure**: Makefile with common commands
- **Tests**: 46 new tests for sanitization (16), accessibility (22), and caching (8)
- **Exports**: `sanitizeDOM`, `clearDOMCache`, `clearImageDimensionCache`, `getDefaultDarkModeStyles`

## [0.1.0] - 2026-04-06

### Added

- Initial release of react-native-html-renderer
- HTML parsing via htmlparser2
- Inline CSS to React Native style conversion via css-to-react-native
- Support for block elements: `<div>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<main>`, `<nav>`, `<aside>`, `<blockquote>`, `<pre>`, `<figure>`
- Support for text elements: `<p>`, `<h1>`-`<h6>`, `<span>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<s>`, `<strike>`, `<del>`, `<ins>`, `<mark>`, `<small>`, `<sub>`, `<sup>`, `<code>`
- Support for lists: `<ul>`, `<ol>`, `<li>` with bullets, numbers, and nesting
- Support for tables: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` with horizontal ScrollView overflow
- Support for images: `<img>` with auto-sizing, loading states, and error fallback
- Support for links: `<a>` with onLinkPress callback
- Support for form elements (read-only): `<input>`, `<textarea>`, `<button>`, `<select>`
- Media placeholders for `<video>` and `<audio>`
- Style cascade: baseStyle, tagsStyles, classesStyles, idsStyles, inline styles
- Custom renderers API for overriding any tag's rendering
- ErrorBoundary for graceful error handling
- Hooks: useHtmlParser, useContentWidth, useTagStyle
- HtmlRendererContext for sharing props through the render tree
- Full TypeScript support with strict mode
- 90 Jest tests across parser, styles, utils, and renderer
- Example app demonstrating all features
