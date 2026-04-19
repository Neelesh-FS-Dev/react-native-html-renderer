import type { ReactNode } from 'react';
import type {
  TextStyle,
  ViewStyle,
  ImageStyle,
  TextProps,
  ViewProps,
  ColorSchemeName,
  LayoutRectangle,
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

// ---------------------------------------------------------------------------
// Form state / interactive forms
// ---------------------------------------------------------------------------

/** State for a single form control. */
export interface FormFieldState {
  /** The field name (from `name` attribute). */
  name: string;
  /** Control type: 'checkbox' | 'radio' | 'text' | 'textarea' | 'select' etc. */
  type: string;
  /** Current value (string for text/textarea/select, boolean for checkbox/radio). */
  value: string | boolean;
}

/** Map of form field name -> current value. */
export type FormState = Record<string, string | boolean | string[]>;

/** Callback invoked when any form control changes. */
export type OnFormChange = (
  field: FormFieldState,
  nextState: FormState
) => void;

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------

export interface RendererPlugin {
  /** Unique plugin name (used for deduplication). */
  name: string;
  /** Map of tag -> custom renderer function. */
  renderers?: Record<string, CustomRenderer>;
  /** Optional setup hook called once when plugin is installed. */
  setup?: () => void;
  /** Optional teardown hook called when plugin is uninstalled. */
  teardown?: () => void;
}

// ---------------------------------------------------------------------------
// Persistent cache adapter (optional user-provided)
// ---------------------------------------------------------------------------

export interface PersistentCacheAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  clear?: () => Promise<void> | void;
}

// ---------------------------------------------------------------------------
// Media queries
// ---------------------------------------------------------------------------

/** Map of breakpoint name -> styles to apply when width matches. */
export interface MediaQueryBreakpoint {
  /** Min width in px (inclusive). */
  minWidth?: number;
  /** Max width in px (inclusive). */
  maxWidth?: number;
  /** Styles to merge when this breakpoint matches. */
  tagsStyles?: TagsStyles;
  classesStyles?: ClassesStyles;
  idsStyles?: IdsStyles;
}

// ---------------------------------------------------------------------------
// Lifecycle callbacks
// ---------------------------------------------------------------------------

export interface RenderMetrics {
  /** Number of DOM nodes rendered (top-level only). */
  nodeCount: number;
  /** Total time taken for parse + render in ms. */
  durationMs: number;
  /** Time spent in parsing only. */
  parseDurationMs: number;
}

export type OnMeasureCallback = (layout: LayoutRectangle) => void;

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

export interface I18nOptions {
  /** Force a writing direction. If omitted, auto-detect from `dir` or `lang`. */
  direction?: 'ltr' | 'rtl' | 'auto';
  /** Locale tag (e.g. 'en-US', 'ar-SA'). Used for number formatting. */
  locale?: string;
}

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

  // --- Lifecycle callbacks ---

  /** Called just before rendering begins, after parse & sanitize. */
  onBeforeRender?: (nodes: DOMNode[]) => void;

  /** Called after render completes, with basic metrics. */
  onAfterRender?: (metrics: RenderMetrics) => void;

  /** Called with the root container's layout on mount and resize. */
  onMeasure?: OnMeasureCallback;

  // --- Performance ---

  /** Render top-level nodes in a virtualized FlatList. Useful for very long docs. */
  virtualized?: boolean;

  /** Defer image loading until it becomes visible (approximate via onLayout). */
  lazyLoadImages?: boolean;

  // --- Forms ---

  /** Initial form state keyed by input `name`. */
  initialFormState?: FormState;

  /** Called on every form control change. */
  onFormChange?: OnFormChange;

  // --- Plugins ---

  /** Plugins to install for this render. Merged with global registry. */
  plugins?: RendererPlugin[];

  // --- Persistent cache ---

  /** Persistent cache adapter (AsyncStorage, MMKV, etc). */
  persistentCache?: PersistentCacheAdapter;

  /** TTL in ms for persistent cache entries. Defaults to 24 hours. */
  persistentCacheTTL?: number;

  // --- Media queries ---

  /** Responsive style breakpoints. Applied when contentWidth matches. */
  mediaQueries?: MediaQueryBreakpoint[];

  // --- i18n ---

  /** Internationalization options. */
  i18n?: I18nOptions;

  // --- Media renderers ---

  /** Custom video renderer (e.g. expo-video adapter). */
  videoRenderer?: CustomRenderer;

  /** Custom audio renderer (e.g. expo-av adapter). */
  audioRenderer?: CustomRenderer;

  /** Custom SVG renderer. Defaults to the built-in minimal SVG renderer. */
  svgRenderer?: CustomRenderer;
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
  /** Defer image loading until layout. */
  lazyLoadImages: boolean;
  /** Form state map (field name -> value). */
  formState: FormState;
  /** Update a form field value. */
  setFormField: (field: FormFieldState) => void;
  /** Detected writing direction ('ltr' | 'rtl'). */
  writingDirection: 'ltr' | 'rtl';
  /** Detected locale. */
  locale: string | undefined;
  /** Custom video renderer. */
  videoRenderer?: CustomRenderer;
  /** Custom audio renderer. */
  audioRenderer?: CustomRenderer;
  /** Custom SVG renderer. */
  svgRenderer?: CustomRenderer;
}
