import { describe, it, expect } from '@jest/globals';
import { parseHTML } from '../parser';
import type { DOMElement, DOMText } from '../types';

describe('parseHTML', () => {
  it('parses a simple paragraph', () => {
    const nodes = parseHTML('<p>Hello</p>');
    expect(nodes).toHaveLength(1);
    const p = nodes[0] as DOMElement;
    expect(p.type).toBe('element');
    expect(p.tag).toBe('p');
    expect(p.children).toHaveLength(1);
    expect((p.children[0] as DOMText).data).toBe('Hello');
  });

  it('parses nested elements', () => {
    const nodes = parseHTML('<div><p>A</p><p>B</p></div>');
    expect(nodes).toHaveLength(1);
    const div = nodes[0] as DOMElement;
    expect(div.tag).toBe('div');
    expect(div.children).toHaveLength(2);
    expect((div.children[0] as DOMElement).tag).toBe('p');
    expect((div.children[1] as DOMElement).tag).toBe('p');
  });

  it('preserves attributes', () => {
    const nodes = parseHTML(
      '<a href="https://example.com" class="link">Click</a>'
    );
    const a = nodes[0] as DOMElement;
    expect(a.attributes.href).toBe('https://example.com');
    expect(a.attributes.class).toBe('link');
  });

  it('strips script tags', () => {
    const nodes = parseHTML(
      '<div><script>alert("xss")</script><p>Safe</p></div>'
    );
    const div = nodes[0] as DOMElement;
    expect(div.children).toHaveLength(1);
    expect((div.children[0] as DOMElement).tag).toBe('p');
  });

  it('strips style tags', () => {
    const nodes = parseHTML('<div><style>body{}</style><p>OK</p></div>');
    const div = nodes[0] as DOMElement;
    expect(div.children).toHaveLength(1);
    expect((div.children[0] as DOMElement).tag).toBe('p');
  });

  it('strips head and meta tags', () => {
    const nodes = parseHTML('<head><meta charset="utf-8"></head><p>Body</p>');
    // head and meta are stripped
    expect(
      nodes.some(
        (n) => n.type === 'element' && (n as DOMElement).tag === 'head'
      )
    ).toBe(false);
    expect(
      nodes.some((n) => n.type === 'element' && (n as DOMElement).tag === 'p')
    ).toBe(true);
  });

  it('respects user-supplied ignoredTags', () => {
    const nodes = parseHTML(
      '<div><span>keep</span><custom>skip</custom></div>',
      new Set(['custom'])
    );
    const div = nodes[0] as DOMElement;
    expect(div.children).toHaveLength(1);
    expect((div.children[0] as DOMElement).tag).toBe('span');
  });

  it('returns empty array for empty string', () => {
    expect(parseHTML('')).toHaveLength(0);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseHTML('   \n\t  ')).toHaveLength(0);
  });

  it('handles malformed HTML gracefully', () => {
    const nodes = parseHTML('<p>Unclosed paragraph<div>Mixed</p></div>');
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('handles self-closing tags', () => {
    const nodes = parseHTML('<br/><hr/><img src="x.png"/>');
    expect(nodes).toHaveLength(3);
    expect((nodes[0] as DOMElement).tag).toBe('br');
    expect((nodes[1] as DOMElement).tag).toBe('hr');
    expect((nodes[2] as DOMElement).tag).toBe('img');
  });

  it('lowercases tag names', () => {
    const nodes = parseHTML('<DIV><P>Test</P></DIV>');
    const div = nodes[0] as DOMElement;
    expect(div.tag).toBe('div');
    expect((div.children[0] as DOMElement).tag).toBe('p');
  });

  it('parses inline styles as attributes', () => {
    const nodes = parseHTML('<p style="color: red">Text</p>');
    const p = nodes[0] as DOMElement;
    expect(p.attributes.style).toBe('color: red');
  });

  it('handles deeply nested structures', () => {
    const html =
      '<div><ul><li><a href="#"><strong>Deep</strong></a></li></ul></div>';
    const nodes = parseHTML(html);
    const div = nodes[0] as DOMElement;
    const ul = div.children[0] as DOMElement;
    const li = ul.children[0] as DOMElement;
    const a = li.children[0] as DOMElement;
    const strong = a.children[0] as DOMElement;
    expect(strong.tag).toBe('strong');
    expect((strong.children[0] as DOMText).data).toBe('Deep');
  });

  it('handles HTML entities in text', () => {
    const nodes = parseHTML('<p>&amp; &lt; &gt;</p>');
    const p = nodes[0] as DOMElement;
    const text = (p.children[0] as DOMText).data;
    expect(text).toContain('&');
    expect(text).toContain('<');
    expect(text).toContain('>');
  });
});
