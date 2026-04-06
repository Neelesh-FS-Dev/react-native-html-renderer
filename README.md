# react-native-html-renderer

[![npm version](https://img.shields.io/npm/v/react-native-html-renderer.svg)](https://www.npmjs.com/package/react-native-html-renderer)
[![license](https://img.shields.io/npm/l/react-native-html-renderer.svg)](https://github.com/Neelesh-FS-Dev/react-native-html-renderer/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/Neelesh-FS-Dev/react-native-html-renderer/actions/workflows/ci.yml/badge.svg)](https://github.com/Neelesh-FS-Dev/react-native-html-renderer/actions/workflows/ci.yml)

Renders HTML into 100% native React Native views — actively maintained, TypeScript-first, and lightweight.

A modern replacement for the abandoned `react-native-render-html`.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Security](#security)
- [Dark Mode](#dark-mode)
- [Accessibility](#accessibility)
- [Font Scaling](#font-scaling)
- [Supported HTML Tags](#supported-html-tags)
- [Custom Renderers](#custom-renderers)
- [Tag & Class Styles](#tag--class-styles)
- [Hooks](#hooks)
- [Utility Exports](#utility-exports)
- [Image Handling](#image-handling)
- [Debug Mode](#debug-mode)
- [Limitations](#limitations)
- [Migration from react-native-render-html v6](#migration-from-react-native-render-html-v6)
- [Contributing](#contributing)
- [License](#license)

## Requirements

| Dependency    | Version   |
| ------------- | --------- |
| React         | >= 18.0.0 |
| React Native  | >= 0.71.0 |
| Node.js       | >= 20     |

## Installation

```sh
npm install react-native-html-renderer
```

or

```sh
yarn add react-native-html-renderer
```

All other dependencies (`htmlparser2`, `css-to-react-native`) are bundled — no extra installs needed.

## Basic Usage

```tsx
import { HtmlRenderer } from 'react-native-html-renderer';
import { useWindowDimensions, Linking } from 'react-native';

function MyComponent() {
  const { width } = useWindowDimensions();

  return (
    <HtmlRenderer
      html="<h1>Hello</h1><p>This is <strong>bold</strong> and <em>italic</em>.</p>"
      contentWidth={width - 32}
      onLinkPress={(href) => Linking.openURL(href)}
    />
  );
}
```

## Props API

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `html` | `string` | *required* | Raw HTML string to render |
| `contentWidth` | `number` | *required* | Available width for layout and image scaling |
| `baseStyle` | `ViewStyle` | `undefined` | Style applied to the root container |
| `tagsStyles` | `Record<string, RNStyle>` | `undefined` | Per-tag style overrides |
| `classesStyles` | `Record<string, RNStyle>` | `undefined` | Styles applied by HTML class name |
| `idsStyles` | `Record<string, RNStyle>` | `undefined` | Styles applied by HTML element id |
| `customRenderers` | `Record<string, CustomRenderer>` | `undefined` | Override rendering for specific tags |
| `onLinkPress` | `(href, attrs) => void` | `undefined` | Callback for `<a>` tag taps |
| `onImagePress` | `(src, attrs) => void` | `undefined` | Callback for image taps |
| `onError` | `(error: Error) => void` | `undefined` | Called on parse or render errors |
| `fallback` | `ReactNode` | default message | Custom UI to show when an error occurs |
| `ignoredTags` | `string[]` | `undefined` | Tags to completely skip (including children) |
| `ignoredStyles` | `string[]` | `undefined` | CSS property names to ignore |
| `allowedStyles` | `string[]` | `undefined` | Whitelist of CSS properties to allow |
| `defaultTextProps` | `TextProps` | `undefined` | Default props for all `<Text>` components |
| `defaultViewProps` | `ViewProps` | `undefined` | Default props for all `<View>` components |
| `renderersProps` | `Record<string, object>` | `undefined` | Extra props for specific tag renderers |
| `maxImagesWidth` | `number` | `undefined` | Maximum image width cap |
| `imagesInitialDimensions` | `{ width, height }` | `{100, 100}` | Placeholder size before image loads |
| `listsPrefixesRenderers` | `ListsPrefixesRenderers` | `undefined` | Custom bullet/number components |
| `emSize` | `number` | `14` | Base em unit in pixels |
| `systemFonts` | `string[]` | `undefined` | Available system fonts |
| `fallbackFonts` | `Record<string, string>` | `undefined` | Map unsupported fonts to fallbacks |
| `debug` | `boolean` | `false` | Log DOM, styles, and show red debug borders |
| `allowDangerousHtml` | `boolean` | `false` | When false, strips dangerous tags and attributes |
| `darkModeStyles` | `Record<string, RNStyle>` | `undefined` | Per-tag overrides applied in dark mode |
| `colorScheme` | `'light' \| 'dark'` | system | Override color scheme detection |
| `allowFontScaling` | `boolean` | `true` | Allow system font-size accessibility scaling |
| `maxFontSizeMultiplier` | `number` | `undefined` | Cap the font-size multiplier |

## Security

By default (when `allowDangerousHtml` is `false`), the renderer automatically:

- Strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<svg>`, `<math>` tags
- Neutralizes `javascript:`, `vbscript:`, and `data:text/html` URLs
- Removes all event handler attributes (`onclick`, `onerror`, `onload`, etc.)
- Guards against prototype pollution and deeply nested DOM attacks

Set `allowDangerousHtml={true}` to opt out of sanitization. See [SECURITY.md](SECURITY.md) for details.

## Dark Mode

The renderer automatically detects the system color scheme and applies dark-mode-aware default styles. You can add per-tag overrides:

```tsx
<HtmlRenderer
  html={html}
  contentWidth={width}
  darkModeStyles={{
    p: { color: '#ddd' },
    pre: { backgroundColor: '#1a1a2e', color: '#eee' },
  }}
/>
```

Override detection with the `colorScheme` prop: `colorScheme="dark"` or `colorScheme="light"`.

Use `getDefaultDarkModeStyles()` to inspect the built-in dark mode defaults.

## Accessibility

All interactive elements include proper accessibility attributes:

- `<a>` → `accessibilityRole="link"`, `accessibilityHint="Opens {href}"`
- `<img>` → `accessibilityRole="image"`, `accessibilityLabel` from `alt`
- `<button>` → `accessibilityRole="button"`
- `<h1>`–`<h6>` → `accessibilityRole="header"`
- `<ul>`/`<ol>` → `accessibilityRole="list"`
- `<input type="checkbox">` → `accessibilityRole="checkbox"`, `accessibilityState.checked`

HTML `aria-*` attributes are mapped to React Native equivalents:

```html
<p aria-label="Custom label">Accessible paragraph</p>
<span aria-hidden="true">Hidden from screen readers</span>
<button aria-disabled="true">Disabled button</button>
```

| HTML attribute | React Native equivalent |
| -------------- | ---------------------- |
| `aria-label` | `accessibilityLabel` |
| `aria-hidden="true"` | `accessible={false}` |
| `aria-disabled` | `accessibilityState.disabled` |
| `aria-checked` | `accessibilityState.checked` |
| `aria-expanded` | `accessibilityState.expanded` |
| `aria-busy` | `accessibilityState.busy` |
| `aria-role` / `role` | `accessibilityRole` |

## Font Scaling

Respects system accessibility font-size settings:

```tsx
<HtmlRenderer
  html={html}
  contentWidth={width}
  allowFontScaling={true}
  maxFontSizeMultiplier={1.5}
/>
```

## Supported HTML Tags

### Block Elements

`<div>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<main>`, `<nav>`, `<aside>`, `<blockquote>`, `<pre>`, `<figure>`

### Text Elements

`<p>`, `<h1>`-`<h6>`, `<span>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<s>`, `<strike>`, `<del>`, `<ins>`, `<mark>`, `<small>`, `<sub>`, `<sup>`, `<code>`, `<label>`

### Media

`<img>` (with auto-sizing, caching, loading state, error fallback), `<video>` and `<audio>` (placeholder views)

### Lists

`<ul>`, `<ol>`, `<li>` with proper bullets/numbers and nested list support

### Tables

`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>` wrapped in horizontal ScrollView

### Links

`<a>` with `onLinkPress` callback

### Forms (read-only)

`<input>`, `<textarea>`, `<button>`, `<select>` rendered as visual read-only elements

### Self-closing

`<br>`, `<hr>`

### Silently Ignored

`<script>`, `<style>`, `<head>`, `<meta>`, `<link>`, `<title>`, `<noscript>`

### Unknown Tags

Unknown tags render their children without crashing. In `debug` mode, a warning is logged.

## Custom Renderers

Override how any tag renders:

```tsx
import { HtmlRenderer } from 'react-native-html-renderer';
import type { CustomRendererProps } from 'react-native-html-renderer';
import { View } from 'react-native';

function myBlockquote({ children, style }: CustomRendererProps) {
  return (
    <View style={{ borderLeftWidth: 4, borderLeftColor: '#3498db', paddingLeft: 12 }}>
      {children}
    </View>
  );
}

<HtmlRenderer
  html="<blockquote><p>Quoted text</p></blockquote>"
  contentWidth={350}
  customRenderers={{ blockquote: myBlockquote }}
/>
```

The `CustomRendererProps` object includes:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `node` | `DOMElement` | The parsed DOM element |
| `children` | `ReactNode[]` | Pre-rendered child nodes |
| `style` | `RNStyle` | Merged style for the element |
| `attributes` | `Record<string, string>` | HTML attributes |
| `passProps` | `Record<string, unknown>` | Extra props from `renderersProps` |
| `renderChildren` | `(nodes: DOMNode[]) => ReactNode[]` | Helper to render child DOM nodes |
| `contentWidth` | `number` | Available content width |

## Tag & Class Styles

```tsx
<HtmlRenderer
  html='<p class="intro">Hello</p><p id="note">Note</p>'
  contentWidth={350}
  tagsStyles={{
    p: { fontSize: 16, lineHeight: 24 },
    h1: { color: '#2c3e50' },
  }}
  classesStyles={{
    intro: { backgroundColor: '#f0f0f0', padding: 8 },
  }}
  idsStyles={{
    note: { fontStyle: 'italic', color: '#999' },
  }}
/>
```

Style cascade order: **default tag style** → **tagsStyles** → **classesStyles** → **idsStyles** → **inline style**

In dark mode: **default dark styles** and **darkModeStyles** are merged into the tag styles layer.

## Hooks

Three reusable hooks exported for use inside custom renderers or elsewhere:

```tsx
import { useHtmlParser, useContentWidth, useTagStyle } from 'react-native-html-renderer';

// Parse HTML into a DOM tree
const nodes = useHtmlParser('<p>Hello</p>');

// Get contentWidth from the nearest HtmlRenderer context
const width = useContentWidth();

// Get the resolved style for a tag from context
const pStyle = useTagStyle('p');
```

## Utility Exports

```tsx
import {
  parseHTML,
  parseInlineStyle,
  getDefaultTagStyles,
  getDefaultDarkModeStyles,
  sanitizeDOM,
  clearDOMCache,
  clearImageDimensionCache,
} from 'react-native-html-renderer';
```

| Export | Description |
| ------ | ----------- |
| `parseHTML(html, ignoredTags?)` | Parse an HTML string into a `DOMNode[]` tree |
| `parseInlineStyle(css, ignored?, allowed?)` | Convert a CSS string to a React Native style object |
| `getDefaultTagStyles(emSize)` | Get the default styles for all supported tags |
| `getDefaultDarkModeStyles()` | Get the built-in dark mode style overrides |
| `sanitizeDOM(nodes)` | Strip dangerous tags, attributes, and URLs from a DOM tree |
| `clearDOMCache()` | Clear the parsed DOM LRU cache (max 50 entries) |
| `clearImageDimensionCache()` | Clear the image dimension LRU cache (max 200 entries) |

## Image Handling

Images automatically:

- Fetch dimensions via `Image.getSize()` for remote URLs
- **Cache dimensions** after first fetch to avoid repeated network calls
- Scale proportionally to fit `contentWidth`
- Respect `maxImagesWidth` cap
- Show a loading indicator while fetching
- Show an error fallback if loading fails
- Support `onImagePress` callback
- Support `data:` base64 URIs

## Error Handling

The renderer handles errors at multiple levels to ensure it never crashes your app:

- **Parse errors** — malformed HTML is caught during parsing; returns empty output and calls `onError`
- **Render errors** — if a node fails to render, it is skipped (other nodes continue rendering)
- **Custom renderer errors** — exceptions in user-provided `customRenderers` are caught per-node; the failing tag is skipped with a debug-mode console error
- **Style errors** — invalid inline CSS is silently ignored
- **Image errors** — failed image loads show a fallback placeholder
- **React ErrorBoundary** — wraps the entire tree as a final safety net

```tsx
<HtmlRenderer
  html={html}
  contentWidth={width}
  onError={(error) => {
    // Log to your error tracking service
    Sentry.captureException(error);
  }}
  fallback={<Text>Something went wrong.</Text>}
/>
```

In `debug` mode, all caught errors are logged to the console with the tag name and stack trace.

## Debug Mode

Set `debug={true}` to enable:

- Parsed DOM tree logged to console
- Computed styles per node logged to console
- Unknown/skipped tags logged as warnings
- Red border drawn around every rendered node
- Color scheme logged to console

## Limitations

- **Form elements are read-only** — `<input>`, `<textarea>`, `<select>`, `<button>` render as visual representations but are not interactive
- **Video and audio are placeholders** — `<video>` and `<audio>` render placeholder views, not playable media (use custom renderers to integrate a media player)
- **No CSS cascade beyond inline** — only inline `style` attributes, tag/class/id overrides, and default styles are supported (no external stylesheets, no `<style>` blocks)
- **Limited CSS properties** — only properties supported by React Native's style system are converted (see `css-to-react-native` for the full list)
- **No CSS animations or transitions**
- **No web component support** (`<slot>`, `<template>`, shadow DOM)
- **Tables may overflow** — wide tables are wrapped in a horizontal `ScrollView`

## Migration from [react-native-render-html](https://github.com/meliorence/react-native-render-html) v6

| react-native-render-html | react-native-html-renderer |
| ------------------------ | -------------------------- |
| `<RenderHtml source={{ html }} />` | `<HtmlRenderer html={html} contentWidth={width} />` |
| `renderers={{ p: PRenderer }}` | `customRenderers={{ p: myPRenderer }}` |
| `tagsStyles={{ p: { ... } }}` | `tagsStyles={{ p: { ... } }}` (same API) |
| `classesStyles={{ ... }}` | `classesStyles={{ ... }}` (same API) |
| `ignoredDomTags={[...]}` | `ignoredTags={[...]}` |
| `renderersProps={{ a: { ... } }}` | `renderersProps={{ a: { ... } }}` (same API) |
| `systemFonts={[...]}` | `systemFonts={[...]}` (same API) |
| `defaultTextProps={{ ... }}` | `defaultTextProps={{ ... }}` (same API) |
| *(no equivalent)* | `allowDangerousHtml` — built-in XSS sanitization |
| *(no equivalent)* | `darkModeStyles` — automatic dark mode support |
| *(no equivalent)* | `allowFontScaling` / `maxFontSizeMultiplier` |

## Contributing

See the [contributing guide](CONTRIBUTING.md) for development workflow and pull request instructions.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
