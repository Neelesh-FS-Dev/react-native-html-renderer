import type { TextStyle, ViewStyle } from 'react-native';
import type { TagsStyles } from '../types';

/**
 * Default dark mode style overrides. These are merged on top of the
 * default light-mode tag styles when the system color scheme is 'dark'.
 */
export function getDefaultDarkModeStyles(): TagsStyles {
  const textColor: TextStyle = { color: '#e0e0e0' };

  return {
    // Text elements — light text on dark background
    p: textColor,
    h1: textColor,
    h2: textColor,
    h3: textColor,
    h4: textColor,
    h5: textColor,
    h6: textColor,
    li: textColor,
    dt: textColor,
    dd: textColor,
    label: textColor,

    // Inline text
    a: { color: '#8ab4f8', textDecorationLine: 'underline' } as TextStyle,
    mark: { backgroundColor: '#5c5c00', color: '#e0e0e0' } as TextStyle,
    code: {
      backgroundColor: '#2d2d2d',
      color: '#e0e0e0',
    } as TextStyle,

    // Preformatted
    pre: {
      backgroundColor: '#1e1e1e',
      color: '#e0e0e0',
    } as TextStyle,

    // Blockquote
    blockquote: {
      borderLeftColor: '#555',
    } as ViewStyle,

    // Tables
    th: {
      ...textColor,
      backgroundColor: '#2d2d2d',
      borderColor: '#444',
    } as TextStyle,
    td: {
      ...textColor,
      borderColor: '#444',
    } as TextStyle,

    // Horizontal rule
    hr: {
      borderBottomColor: '#555',
    } as ViewStyle,

    // Forms (read-only)
    input: {
      ...textColor,
      borderColor: '#555',
      backgroundColor: '#2d2d2d',
    } as TextStyle,
    textarea: {
      ...textColor,
      borderColor: '#555',
      backgroundColor: '#2d2d2d',
    } as TextStyle,
    button: {
      backgroundColor: '#444',
    } as ViewStyle,
    select: {
      ...textColor,
      borderColor: '#555',
      backgroundColor: '#2d2d2d',
    } as TextStyle,
  };
}
