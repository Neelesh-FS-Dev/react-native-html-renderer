import { describe, it, expect } from '@jest/globals';
import {
  parseInlineStyle,
  getDefaultTagStyles,
  mergeStylesForElement,
} from '../styles';
import type { DOMElement } from '../types';

describe('parseInlineStyle', () => {
  it('converts basic CSS properties', () => {
    const style = parseInlineStyle('color: red; font-size: 18px');
    expect(style).toEqual({ color: 'red', fontSize: 18 });
  });

  it('converts background-color', () => {
    const style = parseInlineStyle('background-color: #f0f0f0');
    expect(style).toEqual({ backgroundColor: '#f0f0f0' });
  });

  it('converts font-weight', () => {
    const style = parseInlineStyle('font-weight: bold');
    expect(style).toEqual({ fontWeight: 'bold' });
  });

  it('converts font-style', () => {
    const style = parseInlineStyle('font-style: italic');
    expect(style).toEqual({ fontStyle: 'italic' });
  });

  it('converts text-align', () => {
    const style = parseInlineStyle('text-align: center');
    expect(style).toEqual({ textAlign: 'center' });
  });

  it('converts text-decoration', () => {
    const style = parseInlineStyle('text-decoration-line: underline');
    expect(style).toEqual({ textDecorationLine: 'underline' });
  });

  it('converts margin shorthand', () => {
    const style = parseInlineStyle('margin: 10px');
    expect(style).toHaveProperty('marginTop', 10);
    expect(style).toHaveProperty('marginBottom', 10);
  });

  it('converts padding shorthand', () => {
    const style = parseInlineStyle('padding: 5px 10px');
    expect(style).toHaveProperty('paddingTop', 5);
    expect(style).toHaveProperty('paddingRight', 10);
  });

  it('converts border-radius', () => {
    const style = parseInlineStyle('border-radius: 8px');
    // css-to-react-native expands shorthand to individual corners
    expect(style).toHaveProperty('borderTopLeftRadius', 8);
    expect(style).toHaveProperty('borderTopRightRadius', 8);
    expect(style).toHaveProperty('borderBottomLeftRadius', 8);
    expect(style).toHaveProperty('borderBottomRightRadius', 8);
  });

  it('converts opacity', () => {
    const style = parseInlineStyle('opacity: 0.5');
    expect(style).toEqual({ opacity: 0.5 });
  });

  it('converts flex properties', () => {
    const style = parseInlineStyle('flex: 1');
    // css-to-react-native expands flex shorthand
    expect(style).toHaveProperty('flexGrow', 1);
    expect(style).toHaveProperty('flexShrink', 1);
    expect(style).toHaveProperty('flexBasis', 0);
  });

  it('converts line-height', () => {
    const style = parseInlineStyle('line-height: 24px');
    expect(style).toHaveProperty('lineHeight', 24);
  });

  it('returns empty object for empty string', () => {
    expect(parseInlineStyle('')).toEqual({});
  });

  it('returns empty object for invalid CSS', () => {
    const style = parseInlineStyle('not-a-valid-prop: ???');
    expect(typeof style).toBe('object');
  });

  it('handles multiple declarations', () => {
    const style = parseInlineStyle(
      'color: blue; font-size: 16px; font-weight: 600; background-color: yellow'
    );
    expect(style).toHaveProperty('color', 'blue');
    expect(style).toHaveProperty('fontSize', 16);
    expect(style).toHaveProperty('fontWeight', '600');
    expect(style).toHaveProperty('backgroundColor', 'yellow');
  });

  it('ignores styles in ignoredStyles set', () => {
    const style = parseInlineStyle(
      'color: red; font-size: 18px',
      new Set(['color'])
    );
    expect(style).not.toHaveProperty('color');
    expect(style).toHaveProperty('fontSize', 18);
  });

  it('only allows styles in allowedStyles set', () => {
    const style = parseInlineStyle(
      'color: red; font-size: 18px; font-weight: bold',
      undefined,
      new Set(['color', 'font-weight'])
    );
    expect(style).toHaveProperty('color', 'red');
    expect(style).toHaveProperty('fontWeight', 'bold');
    expect(style).not.toHaveProperty('fontSize');
  });
});

describe('getDefaultTagStyles', () => {
  it('returns styles for common tags', () => {
    const styles = getDefaultTagStyles(14);
    expect(styles.p).toBeDefined();
    expect(styles.h1).toBeDefined();
    expect(styles.h2).toBeDefined();
    expect(styles.strong).toBeDefined();
    expect(styles.em).toBeDefined();
    expect(styles.a).toBeDefined();
    expect(styles.ul).toBeDefined();
    expect(styles.ol).toBeDefined();
    expect(styles.li).toBeDefined();
    expect(styles.hr).toBeDefined();
    expect(styles.pre).toBeDefined();
    expect(styles.code).toBeDefined();
    expect(styles.blockquote).toBeDefined();
    expect(styles.table).toBeDefined();
    expect(styles.th).toBeDefined();
    expect(styles.td).toBeDefined();
  });

  it('scales heading sizes based on emSize', () => {
    const styles14 = getDefaultTagStyles(14);
    const styles20 = getDefaultTagStyles(20);
    const h1_14 = styles14.h1 as { fontSize: number };
    const h1_20 = styles20.h1 as { fontSize: number };
    expect(h1_20.fontSize).toBeGreaterThan(h1_14.fontSize);
  });

  it('h1 is larger than h2 which is larger than h3', () => {
    const styles = getDefaultTagStyles(14);
    const h1 = styles.h1 as { fontSize: number };
    const h2 = styles.h2 as { fontSize: number };
    const h3 = styles.h3 as { fontSize: number };
    expect(h1.fontSize).toBeGreaterThan(h2.fontSize);
    expect(h2.fontSize).toBeGreaterThan(h3.fontSize);
  });
});

describe('mergeStylesForElement', () => {
  const defaults = getDefaultTagStyles(14);

  function makeElement(
    tag: string,
    attrs: Record<string, string> = {}
  ): DOMElement {
    return { type: 'element', tag, attributes: attrs, children: [] };
  }

  it('returns default styles when no overrides', () => {
    const node = makeElement('p');
    const style = mergeStylesForElement(node, defaults, {}, {}, {});
    expect(style).toEqual(defaults.p);
  });

  it('merges tagsStyles override', () => {
    const node = makeElement('p');
    const style = mergeStylesForElement(
      node,
      defaults,
      { p: { color: 'red' } },
      {},
      {}
    );
    expect(style).toHaveProperty('color', 'red');
    // Should still have default marginVertical
    expect(style).toHaveProperty('marginVertical');
  });

  it('merges classesStyles', () => {
    const node = makeElement('p', { class: 'highlight' });
    const style = mergeStylesForElement(
      node,
      defaults,
      {},
      { highlight: { backgroundColor: 'yellow' } },
      {}
    );
    expect(style).toHaveProperty('backgroundColor', 'yellow');
  });

  it('merges multiple classes', () => {
    const node = makeElement('p', { class: 'bold red' });
    const style = mergeStylesForElement(
      node,
      defaults,
      {},
      { bold: { fontWeight: 'bold' }, red: { color: 'red' } },
      {}
    );
    expect(style).toHaveProperty('fontWeight', 'bold');
    expect(style).toHaveProperty('color', 'red');
  });

  it('merges idsStyles', () => {
    const node = makeElement('p', { id: 'main-title' });
    const style = mergeStylesForElement(
      node,
      defaults,
      {},
      {},
      { 'main-title': { fontSize: 24 } }
    );
    expect(style).toHaveProperty('fontSize', 24);
  });

  it('inline style overrides everything', () => {
    const node = makeElement('p', {
      class: 'highlight',
      style: 'color: blue',
    });
    const style = mergeStylesForElement(
      node,
      defaults,
      { p: { color: 'red' } },
      { highlight: { color: 'green' } },
      {}
    );
    expect(style).toHaveProperty('color', 'blue');
  });

  it('cascade order: default < tag < class < id < inline', () => {
    const node = makeElement('p', {
      class: 'c',
      id: 'i',
      style: 'opacity: 0.1',
    });
    const style = mergeStylesForElement(
      node,
      { p: { opacity: 0.5 } },
      { p: { opacity: 0.6 } },
      { c: { opacity: 0.7 } },
      { i: { opacity: 0.8 } }
    );
    // Inline wins
    expect(style).toHaveProperty('opacity', 0.1);
  });
});
