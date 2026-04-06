import type { ReactNode } from 'react';
import type {
  TextStyle,
  ViewStyle,
  ImageStyle,
  TextProps,
  ViewProps,
  ColorSchemeName,
} from 'react-native';

// ---------------------------------------------------------------------------
// DOM Nodes
// ---------------------------------------------------------------------------

/** A parsed DOM node — either an element or a text node. */
export type DOMNode = DOMElement | DOMText;

/** An HTML element node with tag, attributes, and children. */
export interface DOMElement {
  type: 'element';
  tag: string;
  attributes: Record<string, string>;
  children: DOMNode[];
}

/** A text node containing raw string data. */
export interface DOMText {
  type: 'text';
  data: string;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

/** Union of all React Native style types. */
export type RNStyle = ViewStyle | TextStyle | ImageStyle;

/** Per-tag style overrides keyed by HTML tag name. */
export type TagsStyles = Record<string, RNStyle>;

/** Per-class style overrides keyed by HTML class name. */
export type ClassesStyles = Record<string, RNStyle>;

/** Per-id style overrides keyed by HTML element id. */
export type IdsStyles = Record<string, RNStyle>;

// ---------------------------------------------------------------------------
// Custom Renderers
// ---------------------------------------------------------------------------

/** Props passed to a custom renderer function. */
export interface CustomRendererProps {
  /** The DOM element node being rendered. */
  node: DOMElement;
  /** Pre-rendered children as React nodes. */
  children: ReactNode[];
  /** Merged style for this element. */
  style: RNStyle;
  /** Attributes from the HTML element. */
  attributes: Record<string, string>;
  /** Extra props passed via renderersProps[tag]. */
  passProps: Record<string, unknown>;
  /** Render helper — call with child DOMNodes to render them. */
  renderChildren: (nodes: DOMNode[]) => ReactNode[];
  /** Current content width from context. */
  contentWidth: number;
}

/** A custom renderer receives props and returns a ReactNode. */
export type CustomRenderer = (props: CustomRendererProps) => ReactNode;

// ---------------------------------------------------------------------------
// List prefix renderers
// ---------------------------------------------------------------------------

export interface ListPrefixRendererProps {
  index: number;
  nestLevel: number;
}

export interface ListsPrefixesRenderers {
  ul?: (props: ListPrefixRendererProps) => ReactNode;
  ol?: (props: ListPrefixRendererProps) => ReactNode;
}

// ---------------------------------------------------------------------------
// HtmlRenderer Props
// ---------------------------------------------------------------------------

/** Props for the main `<HtmlRenderer />` component. */
export interface HtmlRendererProps {
  /** Raw HTML string to render. */
  html: string;

  /** Available width for content layout and image scaling. */
  contentWidth: number;

  /** Base style applied to the root container. */
  baseStyle?: ViewStyle;

  /** Per-tag style overrides. */
  tagsStyles?: TagsStyles;

  /** Styles applied by HTML class name. */
  classesStyles?: ClassesStyles;

  /** Styles applied by HTML element id. */
  idsStyles?: IdsStyles;

  /** Override rendering for specific tags. */
  customRenderers?: Record<string, CustomRenderer>;

  /** Called when a link (`<a>`) is pressed. */
  onLinkPress?: (href: string, attributes: Record<string, string>) => void;

  /** Called when an image is pressed. */
  onImagePress?: (src: string, attributes: Record<string, string>) => void;

  /** Called when an error occurs during parsing or rendering. */
  onError?: (error: Error) => void;

  /** Custom fallback UI to show when an error occurs. If omitted, a default error message is shown. Set to `null` to render nothing on error. */
  fallback?: ReactNode;

  /** Tags to completely ignore (including their children). */
  ignoredTags?: string[];

  /** CSS property names to ignore during style conversion. */
  ignoredStyles?: string[];

  /** Whitelist of CSS property names to allow (if set, only these are kept). */
  allowedStyles?: string[];

  /** Default props passed to every `<Text>` component. */
  defaultTextProps?: TextProps;

  /** Default props passed to every `<View>` component. */
  defaultViewProps?: ViewProps;

  /** Extra props forwarded to specific tag renderers. */
  renderersProps?: Record<string, Record<string, unknown>>;

  /** Maximum width for images. */
  maxImagesWidth?: number;

  /** Placeholder dimensions before image loads. */
  imagesInitialDimensions?: { width: number; height: number };

  /** Custom bullet/number renderers for lists. */
  listsPrefixesRenderers?: ListsPrefixesRenderers;

  /** Base em unit in pixels (default 14). */
  emSize?: number;

  /** List of available system fonts. */
  systemFonts?: string[];

  /** Map unsupported font families to fallback fonts. */
  fallbackFonts?: Record<string, string>;

  /** Log parsed DOM and computed styles to the console. */
  debug?: boolean;

  // --- Security ---

  /**
   * When false (default), dangerous tags (`<script>`, `<iframe>`, `<object>`,
   * `<embed>`, `<form>`) and `javascript:` hrefs are stripped automatically.
   * Set to true to allow all HTML through (use with caution).
   */
  allowDangerousHtml?: boolean;

  // --- Dark Mode ---

  /** Per-tag style overrides applied when the system is in dark mode. */
  darkModeStyles?: TagsStyles;

  /**
   * Override color scheme detection. When omitted the system scheme is used
   * via `useColorScheme()`.
   */
  colorScheme?: ColorSchemeName;

  // --- Font Scaling ---

  /** Allow system font-size accessibility scaling (default true). */
  allowFontScaling?: boolean;

  /** Cap the font-size multiplier for accessibility scaling. */
  maxFontSizeMultiplier?: number;
}

// ---------------------------------------------------------------------------
// Internal Context
// ---------------------------------------------------------------------------

/** Shape of the context shared through the renderer tree. */
export interface HtmlRendererContextValue {
  contentWidth: number;
  tagsStyles: TagsStyles;
  classesStyles: ClassesStyles;
  idsStyles: IdsStyles;
  customRenderers: Record<string, CustomRenderer>;
  onLinkPress?: (href: string, attributes: Record<string, string>) => void;
  onImagePress?: (src: string, attributes: Record<string, string>) => void;
  renderersProps: Record<string, Record<string, unknown>>;
  emSize: number;
  debug: boolean;
  ignoredTags: Set<string>;
  ignoredStyles: Set<string>;
  allowedStyles: Set<string> | null;
  defaultTextProps?: TextProps;
  defaultViewProps?: ViewProps;
  maxImagesWidth?: number;
  imagesInitialDimensions: { width: number; height: number };
  listsPrefixesRenderers?: ListsPrefixesRenderers;
  systemFonts?: string[];
  fallbackFonts?: Record<string, string>;
  nestLevel: number;
  /** Resolved color scheme — 'dark' | 'light' | null | undefined. */
  colorScheme: ColorSchemeName | null | undefined;
  /** Dark mode tag style overrides (merged into tagsStyles when dark). */
  darkModeStyles: TagsStyles;
  /** Allow system font scaling on Text components. */
  allowFontScaling: boolean;
  /** Cap the font size multiplier. */
  maxFontSizeMultiplier?: number;
}
