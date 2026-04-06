import type { AccessibilityRole } from 'react-native';
import type { DOMElement } from '../types';
import { extractTextContent } from './index';

/** Map HTML tags to React Native accessibility roles. */
const TAG_TO_ROLE: Record<string, AccessibilityRole> = {
  a: 'link',
  button: 'button',
  img: 'image',
  h1: 'header',
  h2: 'header',
  h3: 'header',
  h4: 'header',
  h5: 'header',
  h6: 'header',
  input: 'none',
  textarea: 'none',
  nav: 'menu',
  form: 'none',
  summary: 'button',
};

/** Accessibility props derived from a DOM element's attributes. */
export interface A11yProps {
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessible?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Extract accessibility props from a DOMElement's HTML attributes.
 * Supports: aria-label, aria-hidden, aria-role, role, alt, title,
 * aria-disabled, aria-selected, aria-checked, aria-busy, aria-expanded.
 */
export function getAccessibilityProps(node: DOMElement): A11yProps {
  const attrs = node.attributes;
  const props: A11yProps = {};

  // Role: aria-role > role attribute > tag-based default
  const ariaRole = attrs['aria-role'] ?? attrs.role;
  if (ariaRole) {
    props.accessibilityRole = ariaRole as AccessibilityRole;
  } else if (TAG_TO_ROLE[node.tag]) {
    props.accessibilityRole = TAG_TO_ROLE[node.tag];
  }

  // Label: aria-label > alt > title > text content for certain tags
  const ariaLabel = attrs['aria-label'];
  if (ariaLabel) {
    props.accessibilityLabel = ariaLabel;
  } else if (attrs.alt) {
    props.accessibilityLabel = attrs.alt;
  } else if (attrs.title) {
    props.accessibilityLabel = attrs.title;
  }

  // Hint: for links, use href as hint
  if (node.tag === 'a' && attrs.href) {
    props.accessibilityHint = `Opens ${attrs.href}`;
  }

  // Hidden: aria-hidden
  if (attrs['aria-hidden'] === 'true') {
    props.importantForAccessibility = 'no-hide-descendants';
    props.accessible = false;
  }

  // Accessibility state
  const state: A11yProps['accessibilityState'] = {};
  let hasState = false;

  if (attrs['aria-disabled'] === 'true' || attrs.disabled != null) {
    state.disabled = true;
    hasState = true;
  }
  if (attrs['aria-selected'] === 'true') {
    state.selected = true;
    hasState = true;
  }
  if (attrs['aria-checked'] != null) {
    state.checked =
      attrs['aria-checked'] === 'mixed'
        ? 'mixed'
        : attrs['aria-checked'] === 'true';
    hasState = true;
  }
  if (attrs['aria-busy'] === 'true') {
    state.busy = true;
    hasState = true;
  }
  if (attrs['aria-expanded'] != null) {
    state.expanded = attrs['aria-expanded'] === 'true';
    hasState = true;
  }

  if (hasState) {
    props.accessibilityState = state;
  }

  return props;
}

/**
 * Build an accessibility label for an image from its attributes.
 */
export function getImageA11yLabel(node: DOMElement): string | undefined {
  return (
    node.attributes['aria-label'] ??
    node.attributes.alt ??
    node.attributes.title ??
    undefined
  );
}

/**
 * Build an accessibility label for a link from its children text.
 */
export function getLinkA11yLabel(node: DOMElement): string | undefined {
  const ariaLabel = node.attributes['aria-label'];
  if (ariaLabel) return ariaLabel;
  const textContent = extractTextContent(node.children);
  return textContent || undefined;
}
