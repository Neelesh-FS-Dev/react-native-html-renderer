import { describe, it, expect } from '@jest/globals';
import {
  cssValueToNumeric,
  isInlineContent,
  resolveUrl,
  extractTextContent,
  INLINE_TAGS,
  TEXT_BLOCK_TAGS,
} from '../utils';
import type { DOMNode, DOMElement, DOMText } from '../types';

describe('cssValueToNumeric', () => {
  it('converts px values', () => {
    expect(cssValueToNumeric('16px', 14)).toBe(16);
  });

  it('converts em values', () => {
    expect(cssValueToNumeric('2em', 14)).toBe(28);
  });

  it('converts rem values', () => {
    expect(cssValueToNumeric('1.5rem', 16)).toBe(24);
  });

  it('converts bare numbers', () => {
    expect(cssValueToNumeric('42', 14)).toBe(42);
  });

  it('returns undefined for percentages', () => {
    expect(cssValueToNumeric('50%', 14)).toBeUndefined();
  });

  it('returns undefined for non-numeric strings', () => {
    expect(cssValueToNumeric('auto', 14)).toBeUndefined();
  });

  it('handles whitespace', () => {
    expect(cssValueToNumeric('  10px  ', 14)).toBe(10);
  });
});

describe('isInlineContent', () => {
  const text: DOMText = { type: 'text', data: 'hello' };
  const span: DOMElement = {
    type: 'element',
    tag: 'span',
    attributes: {},
    children: [text],
  };
  const div: DOMElement = {
    type: 'element',
    tag: 'div',
    attributes: {},
    children: [text],
  };

  it('returns true for text-only nodes', () => {
    expect(isInlineContent([text])).toBe(true);
  });

  it('returns true for inline elements', () => {
    expect(isInlineContent([text, span])).toBe(true);
  });

  it('returns false when block element is present', () => {
    expect(isInlineContent([text, div])).toBe(false);
  });

  it('returns true for empty array', () => {
    expect(isInlineContent([])).toBe(true);
  });
});

describe('resolveUrl', () => {
  it('returns URL as-is when no baseUrl', () => {
    expect(resolveUrl('img.png')).toBe('img.png');
  });

  it('returns absolute URL as-is', () => {
    expect(resolveUrl('https://example.com/img.png', 'https://base.com')).toBe(
      'https://example.com/img.png'
    );
  });

  it('returns data URLs as-is', () => {
    expect(resolveUrl('data:image/png;base64,abc', 'https://base.com')).toBe(
      'data:image/png;base64,abc'
    );
  });

  it('resolves relative URL with baseUrl', () => {
    expect(resolveUrl('img.png', 'https://base.com')).toBe(
      'https://base.com/img.png'
    );
  });

  it('resolves absolute-path URL with baseUrl', () => {
    expect(resolveUrl('/images/img.png', 'https://base.com')).toBe(
      'https://base.com/images/img.png'
    );
  });

  it('handles baseUrl with trailing slash', () => {
    expect(resolveUrl('img.png', 'https://base.com/')).toBe(
      'https://base.com/img.png'
    );
  });
});

describe('extractTextContent', () => {
  it('extracts text from text nodes', () => {
    const nodes: DOMNode[] = [{ type: 'text', data: 'Hello world' }];
    expect(extractTextContent(nodes)).toBe('Hello world');
  });

  it('extracts text from nested elements', () => {
    const nodes: DOMNode[] = [
      {
        type: 'element',
        tag: 'p',
        attributes: {},
        children: [
          { type: 'text', data: 'Hello ' },
          {
            type: 'element',
            tag: 'strong',
            attributes: {},
            children: [{ type: 'text', data: 'world' }],
          },
        ],
      },
    ];
    expect(extractTextContent(nodes)).toBe('Hello world');
  });

  it('converts br to newline', () => {
    const nodes: DOMNode[] = [
      { type: 'text', data: 'Line 1' },
      { type: 'element', tag: 'br', attributes: {}, children: [] },
      { type: 'text', data: 'Line 2' },
    ];
    expect(extractTextContent(nodes)).toBe('Line 1\nLine 2');
  });

  it('returns empty string for empty array', () => {
    expect(extractTextContent([])).toBe('');
  });
});

describe('tag sets', () => {
  it('INLINE_TAGS contains common inline tags', () => {
    expect(INLINE_TAGS.has('span')).toBe(true);
    expect(INLINE_TAGS.has('strong')).toBe(true);
    expect(INLINE_TAGS.has('em')).toBe(true);
    expect(INLINE_TAGS.has('a')).toBe(true);
    expect(INLINE_TAGS.has('code')).toBe(true);
    expect(INLINE_TAGS.has('br')).toBe(true);
  });

  it('INLINE_TAGS does not contain block tags', () => {
    expect(INLINE_TAGS.has('div')).toBe(false);
    expect(INLINE_TAGS.has('p')).toBe(false);
    expect(INLINE_TAGS.has('h1')).toBe(false);
  });

  it('TEXT_BLOCK_TAGS contains text block tags', () => {
    expect(TEXT_BLOCK_TAGS.has('p')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('h1')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('h6')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('li')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('td')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('th')).toBe(true);
    expect(TEXT_BLOCK_TAGS.has('pre')).toBe(true);
  });
});
