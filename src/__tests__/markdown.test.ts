import { describe, it, expect } from '@jest/globals';
import { markdownToHtml } from '../utils/markdown';

describe('markdownToHtml', () => {
  it('converts headings', () => {
    expect(markdownToHtml('# Title')).toContain('<h1>Title</h1>');
    expect(markdownToHtml('### Sub')).toContain('<h3>Sub</h3>');
  });

  it('converts bold and italic', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>');
    expect(markdownToHtml('*italic*')).toContain('<em>italic</em>');
  });

  it('converts links and images', () => {
    expect(markdownToHtml('[x](https://y.com)')).toContain(
      '<a href="https://y.com">x</a>'
    );
    expect(markdownToHtml('![alt](a.png)')).toContain(
      '<img src="a.png" alt="alt" />'
    );
  });

  it('converts lists', () => {
    const out = markdownToHtml('- one\n- two');
    expect(out).toContain('<ul>');
    expect(out).toContain('<li>one</li>');
  });

  it('converts code blocks', () => {
    const out = markdownToHtml('```\nvar a=1\n```');
    expect(out).toContain('<pre><code>');
    expect(out).toContain('var a=1');
  });

  it('converts paragraphs', () => {
    expect(markdownToHtml('Hello world')).toContain('<p>Hello world</p>');
  });
});
