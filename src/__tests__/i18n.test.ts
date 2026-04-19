import { describe, it, expect } from '@jest/globals';
import { detectDirection, detectLocale, formatNumber } from '../utils/i18n';
import { parseHTML } from '../parser';

describe('i18n', () => {
  describe('detectDirection', () => {
    it('honors user override', () => {
      expect(detectDirection([], { direction: 'rtl' })).toBe('rtl');
    });

    it('reads dir attribute', () => {
      const nodes = parseHTML('<div dir="rtl">hello</div>');
      expect(detectDirection(nodes, undefined)).toBe('rtl');
    });

    it('infers from Arabic lang', () => {
      const nodes = parseHTML('<div lang="ar-SA">x</div>');
      expect(detectDirection(nodes, undefined)).toBe('rtl');
    });

    it('falls back to ltr', () => {
      const nodes = parseHTML('<div>hi</div>');
      expect(detectDirection(nodes, undefined)).toBe('ltr');
    });
  });

  describe('detectLocale', () => {
    it('reads lang attribute', () => {
      const nodes = parseHTML('<div lang="fr-FR">x</div>');
      expect(detectLocale(nodes, undefined)).toBe('fr-FR');
    });

    it('honors options locale', () => {
      expect(detectLocale([], { locale: 'de-DE' })).toBe('de-DE');
    });
  });

  describe('formatNumber', () => {
    it('formats with locale', () => {
      const out = formatNumber(1234.5, 'en-US');
      expect(out).toMatch(/1,234/);
    });

    it('falls back to toString without locale', () => {
      expect(formatNumber(42, undefined)).toBe('42');
    });
  });
});
