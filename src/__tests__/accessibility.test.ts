import { describe, it, expect } from '@jest/globals';
import {
  getAccessibilityProps,
  getImageA11yLabel,
  getLinkA11yLabel,
} from '../utils/accessibility';
import type { DOMElement } from '../types';

function el(
  tag: string,
  attrs: Record<string, string> = {},
  children: DOMElement['children'] = []
): DOMElement {
  return { type: 'element', tag, attributes: attrs, children };
}

describe('getAccessibilityProps', () => {
  it('maps <a> to link role', () => {
    const props = getAccessibilityProps(el('a', { href: '#' }));
    expect(props.accessibilityRole).toBe('link');
  });

  it('maps <button> to button role', () => {
    const props = getAccessibilityProps(el('button'));
    expect(props.accessibilityRole).toBe('button');
  });

  it('maps <img> to image role', () => {
    const props = getAccessibilityProps(el('img', { src: 'x.png' }));
    expect(props.accessibilityRole).toBe('image');
  });

  it('maps heading tags to header role', () => {
    for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const props = getAccessibilityProps(el(tag));
      expect(props.accessibilityRole).toBe('header');
    }
  });

  it('uses aria-role attribute over default', () => {
    const props = getAccessibilityProps(el('div', { 'aria-role': 'alert' }));
    expect(props.accessibilityRole).toBe('alert');
  });

  it('uses role attribute', () => {
    const props = getAccessibilityProps(el('div', { role: 'navigation' }));
    expect(props.accessibilityRole).toBe('navigation');
  });

  it('uses aria-label for accessibilityLabel', () => {
    const props = getAccessibilityProps(
      el('div', { 'aria-label': 'Main content' })
    );
    expect(props.accessibilityLabel).toBe('Main content');
  });

  it('uses alt for accessibilityLabel', () => {
    const props = getAccessibilityProps(el('img', { alt: 'Photo of sunset' }));
    expect(props.accessibilityLabel).toBe('Photo of sunset');
  });

  it('uses title for accessibilityLabel as fallback', () => {
    const props = getAccessibilityProps(el('div', { title: 'Tooltip text' }));
    expect(props.accessibilityLabel).toBe('Tooltip text');
  });

  it('sets accessibilityHint for links', () => {
    const props = getAccessibilityProps(
      el('a', { href: 'https://example.com' })
    );
    expect(props.accessibilityHint).toBe('Opens https://example.com');
  });

  it('handles aria-hidden=true', () => {
    const props = getAccessibilityProps(el('div', { 'aria-hidden': 'true' }));
    expect(props.accessible).toBe(false);
    expect(props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('does not set accessible=false for aria-hidden=false', () => {
    const props = getAccessibilityProps(el('div', { 'aria-hidden': 'false' }));
    expect(props.accessible).toBeUndefined();
  });

  it('handles aria-disabled', () => {
    const props = getAccessibilityProps(
      el('button', { 'aria-disabled': 'true' })
    );
    expect(props.accessibilityState?.disabled).toBe(true);
  });

  it('handles disabled attribute', () => {
    const props = getAccessibilityProps(el('input', { disabled: '' }));
    expect(props.accessibilityState?.disabled).toBe(true);
  });

  it('handles aria-checked=true', () => {
    const props = getAccessibilityProps(
      el('input', { 'aria-checked': 'true' })
    );
    expect(props.accessibilityState?.checked).toBe(true);
  });

  it('handles aria-checked=mixed', () => {
    const props = getAccessibilityProps(
      el('input', { 'aria-checked': 'mixed' })
    );
    expect(props.accessibilityState?.checked).toBe('mixed');
  });

  it('handles aria-expanded', () => {
    const props = getAccessibilityProps(el('div', { 'aria-expanded': 'true' }));
    expect(props.accessibilityState?.expanded).toBe(true);
  });

  it('handles aria-busy', () => {
    const props = getAccessibilityProps(el('div', { 'aria-busy': 'true' }));
    expect(props.accessibilityState?.busy).toBe(true);
  });

  it('returns empty object for plain div', () => {
    const props = getAccessibilityProps(el('div'));
    expect(props.accessibilityRole).toBeUndefined();
    expect(props.accessibilityLabel).toBeUndefined();
    expect(props.accessibilityState).toBeUndefined();
  });
});

describe('getImageA11yLabel', () => {
  it('returns aria-label first', () => {
    const label = getImageA11yLabel(
      el('img', { 'aria-label': 'Custom label', 'alt': 'Alt text' })
    );
    expect(label).toBe('Custom label');
  });

  it('returns alt when no aria-label', () => {
    const label = getImageA11yLabel(el('img', { alt: 'Alt text' }));
    expect(label).toBe('Alt text');
  });

  it('returns title as fallback', () => {
    const label = getImageA11yLabel(el('img', { title: 'Title' }));
    expect(label).toBe('Title');
  });

  it('returns undefined when no label attributes', () => {
    expect(getImageA11yLabel(el('img'))).toBeUndefined();
  });
});

describe('getLinkA11yLabel', () => {
  it('returns aria-label first', () => {
    const label = getLinkA11yLabel(
      el('a', { 'aria-label': 'Custom' }, [{ type: 'text', data: 'Click' }])
    );
    expect(label).toBe('Custom');
  });

  it('returns text content when no aria-label', () => {
    const label = getLinkA11yLabel(
      el('a', {}, [{ type: 'text', data: 'Click me' }])
    );
    expect(label).toBe('Click me');
  });

  it('returns undefined for empty link', () => {
    expect(getLinkA11yLabel(el('a'))).toBeUndefined();
  });
});
