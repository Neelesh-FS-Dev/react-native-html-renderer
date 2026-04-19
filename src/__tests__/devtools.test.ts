import { describe, it, expect, jest } from '@jest/globals';
import {
  inspectTree,
  formatInspectorTree,
  profile,
  accessibilityAudit,
} from '../devtools';
import { parseHTML } from '../parser';

describe('devtools', () => {
  describe('inspectTree / formatInspectorTree', () => {
    it('produces a serializable tree and renders indented text', () => {
      const nodes = parseHTML('<div><p>hi</p></div>');
      const tree = inspectTree(nodes);
      expect(tree[0]).toMatchObject({ type: 'element', tag: 'div' });
      const formatted = formatInspectorTree(tree);
      expect(formatted).toContain('<div>');
      expect(formatted).toContain('<p>');
    });
  });

  describe('profile', () => {
    it('reports duration for wrapped fn', () => {
      const sample = jest.fn();
      const result = profile(
        'test',
        () => {
          let x = 0;
          for (let i = 0; i < 100; i++) x += i;
          return x;
        },
        sample
      );
      expect(result).toBe(4950);
      expect(sample).toHaveBeenCalledTimes(1);
      const call = sample.mock.calls[0]![0] as {
        label: string;
        durationMs: number;
      };
      expect(call.label).toBe('test');
      expect(typeof call.durationMs).toBe('number');
    });
  });

  describe('accessibilityAudit', () => {
    it('flags img without alt', () => {
      const nodes = parseHTML('<img src="x.png" />');
      const warnings = accessibilityAudit(nodes);
      expect(warnings.some((w) => w.rule === 'img-alt')).toBe(true);
    });

    it('flags anchors with no accessible name', () => {
      const nodes = parseHTML('<a href="/x"></a>');
      const warnings = accessibilityAudit(nodes);
      expect(warnings.some((w) => w.rule === 'link-name')).toBe(true);
    });

    it('flags skipped heading levels', () => {
      const nodes = parseHTML('<h1>a</h1><h3>b</h3>');
      const warnings = accessibilityAudit(nodes);
      expect(warnings.some((w) => w.rule === 'heading-order')).toBe(true);
    });

    it('passes clean HTML', () => {
      const nodes = parseHTML(
        '<h1>A</h1><img src="x" alt="a"/><a href="/x">ok</a>'
      );
      expect(accessibilityAudit(nodes)).toHaveLength(0);
    });
  });
});
