import { describe, it, expect } from '@jest/globals';
import {
  extractLinks,
  extractImages,
  htmlToText,
  generateTOC,
} from '../utils/extractors';

describe('extractors', () => {
  describe('extractLinks', () => {
    it('extracts all anchor tags with href', () => {
      const links = extractLinks(
        '<p>Visit <a href="https://a.com">A</a> and <a href="/b">B</a></p>'
      );
      expect(links).toHaveLength(2);
      expect(links[0]).toMatchObject({ href: 'https://a.com', text: 'A' });
      expect(links[1]).toMatchObject({ href: '/b', text: 'B' });
    });

    it('ignores anchors without href', () => {
      const links = extractLinks('<a>noop</a><a href="#x">x</a>');
      expect(links).toHaveLength(1);
    });
  });

  describe('extractImages', () => {
    it('extracts all img tags with src', () => {
      const imgs = extractImages(
        '<img src="a.png" alt="a" /><img src="b.jpg" />'
      );
      expect(imgs).toHaveLength(2);
      expect(imgs[0]).toMatchObject({ src: 'a.png', alt: 'a' });
    });
  });

  describe('htmlToText', () => {
    it('strips tags and preserves block breaks', () => {
      const text = htmlToText(
        '<h1>Title</h1><p>Hello <strong>world</strong></p>'
      );
      expect(text).toContain('Title');
      expect(text).toContain('Hello world');
    });

    it('inserts newline for <br>', () => {
      expect(htmlToText('<p>a<br/>b</p>')).toContain('a\nb');
    });

    it('skips <script> and <style>', () => {
      const text = htmlToText(
        '<script>var x=1</script><p>hi</p><style>a{}</style>'
      );
      expect(text).not.toContain('var x');
      expect(text).toContain('hi');
    });
  });

  describe('generateTOC', () => {
    it('extracts headings with levels and slug ids', () => {
      const toc = generateTOC('<h1>One</h1><p>x</p><h2>Two Three</h2>');
      expect(toc).toEqual([
        { level: 1, text: 'One', id: 'one' },
        { level: 2, text: 'Two Three', id: 'two-three' },
      ]);
    });

    it('honors existing id on heading', () => {
      const toc = generateTOC('<h1 id="custom">Title</h1>');
      expect(toc[0]!.id).toBe('custom');
    });
  });
});
