import { describe, it, expect } from '@jest/globals';
import { sanitizeDOM } from '../utils/sanitize';
import type { DOMElement, DOMNode, DOMText } from '../types';

function el(
  tag: string,
  attrs: Record<string, string> = {},
  children: DOMNode[] = []
): DOMElement {
  return { type: 'element', tag, attributes: attrs, children };
}
function txt(data: string): DOMText {
  return { type: 'text', data };
}

describe('sanitizeDOM', () => {
  // --- Dangerous tag stripping ---

  it('strips script tags entirely', () => {
    const nodes: DOMNode[] = [
      el('div', {}, [
        el('script', {}, [txt('alert("xss")')]),
        el('p', {}, [txt('safe')]),
      ]),
    ];
    const result = sanitizeDOM(nodes);
    const div = result[0] as DOMElement;
    expect(div.children).toHaveLength(1);
    expect((div.children[0] as DOMElement).tag).toBe('p');
  });

  it('strips iframe tags', () => {
    expect(sanitizeDOM([el('iframe', { src: 'evil.html' })])).toHaveLength(0);
  });

  it('strips object and embed tags', () => {
    expect(sanitizeDOM([el('object'), el('embed')])).toHaveLength(0);
  });

  it('strips form tags', () => {
    expect(
      sanitizeDOM([el('form', { action: '/submit' }, [el('input')])])
    ).toHaveLength(0);
  });

  it('strips base tags', () => {
    expect(sanitizeDOM([el('base', { href: '/' })])).toHaveLength(0);
  });

  it('strips svg tags', () => {
    expect(sanitizeDOM([el('svg')])).toHaveLength(0);
  });

  it('strips math tags', () => {
    expect(sanitizeDOM([el('math')])).toHaveLength(0);
  });

  it('strips frame and frameset tags', () => {
    expect(sanitizeDOM([el('frame'), el('frameset')])).toHaveLength(0);
  });

  it('strips template tags', () => {
    expect(sanitizeDOM([el('template')])).toHaveLength(0);
  });

  it('strips noscript tags', () => {
    expect(sanitizeDOM([el('noscript')])).toHaveLength(0);
  });

  // --- Event handler stripping (on* prefix match) ---

  it('strips onclick and other common event handlers', () => {
    const nodes: DOMNode[] = [
      el('div', {
        onclick: 'alert(1)',
        onload: 'hack()',
        class: 'safe',
      }),
    ];
    const result = sanitizeDOM(nodes);
    const div = result[0] as DOMElement;
    expect(div.attributes.onclick).toBeUndefined();
    expect(div.attributes.onload).toBeUndefined();
    expect(div.attributes.class).toBe('safe');
  });

  it('strips ALL on* attributes including uncommon ones', () => {
    const attrs: Record<string, string> = {
      onanimationend: 'x',
      ondragstart: 'x',
      onpointerdown: 'x',
      onwheel: 'x',
      ontransitionend: 'x',
      onvisibilitychange: 'x',
      onfocusin: 'x',
      onpaste: 'x',
      id: 'keep',
    };
    const result = sanitizeDOM([el('div', attrs)]);
    const div = result[0] as DOMElement;
    expect(Object.keys(div.attributes)).toEqual(['id']);
  });

  // --- URL sanitization (scheme allowlist) ---

  it('neutralizes javascript: hrefs', () => {
    const nodes: DOMNode[] = [
      // eslint-disable-next-line no-script-url
      el('a', { href: 'javascript:alert(1)' }, [txt('click me')]),
    ];
    const result = sanitizeDOM(nodes);
    expect((result[0] as DOMElement).attributes.href).toBe('#');
  });

  it('neutralizes javascript: with null bytes', () => {
    const result = sanitizeDOM([
      el('a', { href: 'java\x00script:alert(1)' }, [txt('link')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe('#');
  });

  it('neutralizes javascript: with tabs/newlines', () => {
    const result = sanitizeDOM([
      el('a', { href: 'java\tscript:alert(1)' }, [txt('link')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe('#');
  });

  it('neutralizes javascript: with mixed case', () => {
    const result = sanitizeDOM([
      el('a', { href: '  JavaScript:void(0)' }, [txt('link')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe('#');
  });

  it('neutralizes vbscript: hrefs', () => {
    const result = sanitizeDOM([
      el('a', { href: 'vbscript:msgbox("xss")' }, [txt('link')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe('#');
  });

  it('removes data:text/html src', () => {
    const result = sanitizeDOM([
      el('img', { src: 'data:text/html,<script>alert(1)</script>' }),
    ]);
    expect((result[0] as DOMElement).attributes.src).toBeUndefined();
  });

  it('allows data:image/ URIs through', () => {
    const result = sanitizeDOM([
      el('img', { src: 'data:image/png;base64,abc123' }),
    ]);
    expect((result[0] as DOMElement).attributes.src).toBe(
      'data:image/png;base64,abc123'
    );
  });

  it('allows safe https hrefs through', () => {
    const result = sanitizeDOM([
      el('a', { href: 'https://example.com' }, [txt('link')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe(
      'https://example.com'
    );
  });

  it('allows mailto: hrefs through', () => {
    const result = sanitizeDOM([
      el('a', { href: 'mailto:test@example.com' }, [txt('email')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe(
      'mailto:test@example.com'
    );
  });

  it('allows tel: hrefs through', () => {
    const result = sanitizeDOM([
      el('a', { href: 'tel:+1234567890' }, [txt('call')]),
    ]);
    expect((result[0] as DOMElement).attributes.href).toBe('tel:+1234567890');
  });

  it('allows relative URLs through', () => {
    const result = sanitizeDOM([el('a', { href: '/about' }, [txt('about')])]);
    expect((result[0] as DOMElement).attributes.href).toBe('/about');
  });

  it('allows fragment URLs through', () => {
    const result = sanitizeDOM([el('a', { href: '#section' }, [txt('jump')])]);
    expect((result[0] as DOMElement).attributes.href).toBe('#section');
  });

  // --- URL-bearing attributes beyond href and src ---

  it('sanitizes poster attribute on video', () => {
    // eslint-disable-next-line no-script-url
    const result = sanitizeDOM([el('div', { poster: 'javascript:x' })]);
    expect((result[0] as DOMElement).attributes.poster).toBeUndefined();
  });

  it('sanitizes formaction attribute', () => {
    // eslint-disable-next-line no-script-url
    const result = sanitizeDOM([el('button', { formaction: 'javascript:x' })]);
    expect((result[0] as DOMElement).attributes.formaction).toBeUndefined();
  });

  it('sanitizes srcset attribute', () => {
    // eslint-disable-next-line no-script-url
    const result = sanitizeDOM([el('img', { srcset: 'javascript:x' })]);
    expect((result[0] as DOMElement).attributes.srcset).toBeUndefined();
  });

  // --- Prototype pollution guard ---

  it('strips __proto__ attribute key', () => {
    const result = sanitizeDOM([
      el('div', { __proto__: 'polluted', id: 'ok' }),
    ]);
    const div = result[0] as DOMElement;
    expect(div.attributes.id).toBe('ok');
    // __proto__ should not appear
    expect(Object.keys(div.attributes)).not.toContain('__proto__');
  });

  // --- Recursion depth limit ---

  it('handles deeply nested DOM without stack overflow', () => {
    // Build 150-deep nesting (exceeds MAX_DEPTH of 100)
    let node: DOMElement = el('div', {}, [txt('deep')]);
    for (let i = 0; i < 150; i++) {
      node = el('div', {}, [node]);
    }
    // Should not throw
    const result = sanitizeDOM([node]);
    expect(result).toHaveLength(1);
  });

  // --- Misc ---

  it('preserves text nodes', () => {
    const nodes: DOMNode[] = [txt('hello'), el('p', {}, [txt('world')])];
    const result = sanitizeDOM(nodes);
    expect(result).toHaveLength(2);
    expect((result[0] as DOMText).data).toBe('hello');
  });

  it('recursively sanitizes children', () => {
    const nodes: DOMNode[] = [
      el('div', {}, [
        el('p', { onclick: 'hack()' }, [
          // eslint-disable-next-line no-script-url
          el('a', { href: 'javascript:void(0)' }, [txt('link')]),
        ]),
      ]),
    ];
    const result = sanitizeDOM(nodes);
    const div = result[0] as DOMElement;
    const p = div.children[0] as DOMElement;
    expect(p.attributes.onclick).toBeUndefined();
    const a = p.children[0] as DOMElement;
    expect(a.attributes.href).toBe('#');
  });
});
