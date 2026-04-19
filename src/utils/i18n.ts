import type { DOMNode, I18nOptions } from '../types';

const RTL_LANG_PREFIXES = [
  'ar',
  'he',
  'fa',
  'ur',
  'ps',
  'yi',
  'dv',
  'ku',
  'ckb',
];

/** Detect writing direction from explicit dir attribute or lang code. */
export function detectDirection(
  nodes: DOMNode[],
  opt: I18nOptions | undefined
): 'ltr' | 'rtl' {
  if (opt?.direction === 'ltr' || opt?.direction === 'rtl')
    return opt.direction;
  // Look at top-level html/body or first element
  for (const n of nodes) {
    if (n.type !== 'element') continue;
    const dir = n.attributes.dir?.toLowerCase();
    if (dir === 'rtl') return 'rtl';
    if (dir === 'ltr') return 'ltr';
    const lang = (n.attributes.lang ?? opt?.locale ?? '').toLowerCase();
    if (lang) {
      const prefix = lang.split('-')[0]!;
      if (RTL_LANG_PREFIXES.includes(prefix)) return 'rtl';
    }
  }
  if (opt?.locale) {
    const prefix = opt.locale.toLowerCase().split('-')[0]!;
    if (RTL_LANG_PREFIXES.includes(prefix)) return 'rtl';
  }
  return 'ltr';
}

/** Detect locale from <html lang> or user-provided option. */
export function detectLocale(
  nodes: DOMNode[],
  opt: I18nOptions | undefined
): string | undefined {
  if (opt?.locale) return opt.locale;
  for (const n of nodes) {
    if (n.type !== 'element') continue;
    if (n.attributes.lang) return n.attributes.lang;
  }
  return undefined;
}

/** Format a number for the detected locale. */
export function formatNumber(n: number, locale: string | undefined): string {
  try {
    if (locale && typeof Intl !== 'undefined') {
      return new Intl.NumberFormat(locale).format(n);
    }
  } catch {
    // fall through
  }
  return String(n);
}
