import transform from 'css-to-react-native';
import type { RNStyle } from '../types';

/**
 * Parse an inline CSS `style` attribute string into a React Native style object.
 *
 * @param styleString - The raw CSS string (e.g. `"color: red; font-size: 18px"`).
 * @param ignoredStyles - CSS property names to exclude.
 * @param allowedStyles - If provided, only these CSS property names are kept.
 * @returns A React Native compatible style object.
 */
export function parseInlineStyle(
  styleString: string,
  ignoredStyles?: Set<string>,
  allowedStyles?: Set<string> | null
): RNStyle {
  if (!styleString) return {};

  try {
    const pairs: [string, string][] = styleString
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((declaration) => {
        const colonIndex = declaration.indexOf(':');
        if (colonIndex === -1) return null;
        const prop = declaration.slice(0, colonIndex).trim();
        const value = declaration.slice(colonIndex + 1).trim();
        return [prop, value] as [string, string];
      })
      .filter((pair): pair is [string, string] => {
        if (!pair) return false;
        const [prop] = pair;
        if (ignoredStyles?.has(prop)) return false;
        if (allowedStyles && !allowedStyles.has(prop)) return false;
        return true;
      });

    if (pairs.length === 0) return {};

    return transform(pairs) as RNStyle;
  } catch {
    return {};
  }
}
