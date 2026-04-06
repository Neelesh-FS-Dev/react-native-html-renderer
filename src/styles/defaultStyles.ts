import type { TextStyle, ViewStyle } from 'react-native';
import type { TagsStyles } from '../types';

/**
 * Returns the default styles for all supported HTML tags.
 *
 * @param emSize - Base em unit in pixels (used for heading sizes etc.).
 */
export function getDefaultTagStyles(emSize: number): TagsStyles {
  const base: TextStyle = { fontSize: emSize };

  return {
    // Block text
    p: { ...base, marginVertical: 4 } as TextStyle,
    h1: {
      ...base,
      fontSize: emSize * 2,
      fontWeight: 'bold',
      marginVertical: 10,
    } as TextStyle,
    h2: {
      ...base,
      fontSize: emSize * 1.5,
      fontWeight: 'bold',
      marginVertical: 9,
    } as TextStyle,
    h3: {
      ...base,
      fontSize: emSize * 1.17,
      fontWeight: 'bold',
      marginVertical: 8,
    } as TextStyle,
    h4: {
      ...base,
      fontWeight: 'bold',
      marginVertical: 6,
    } as TextStyle,
    h5: {
      ...base,
      fontSize: emSize * 0.83,
      fontWeight: 'bold',
      marginVertical: 5,
    } as TextStyle,
    h6: {
      ...base,
      fontSize: emSize * 0.67,
      fontWeight: 'bold',
      marginVertical: 4,
    } as TextStyle,

    // Inline text
    strong: { fontWeight: 'bold' } as TextStyle,
    b: { fontWeight: 'bold' } as TextStyle,
    em: { fontStyle: 'italic' } as TextStyle,
    i: { fontStyle: 'italic' } as TextStyle,
    u: { textDecorationLine: 'underline' } as TextStyle,
    s: { textDecorationLine: 'line-through' } as TextStyle,
    strike: { textDecorationLine: 'line-through' } as TextStyle,
    del: { textDecorationLine: 'line-through' } as TextStyle,
    ins: { textDecorationLine: 'underline' } as TextStyle,
    mark: { backgroundColor: '#ff0' } as TextStyle,
    small: { fontSize: emSize * 0.8 } as TextStyle,
    sub: { fontSize: emSize * 0.75 } as TextStyle,
    sup: { fontSize: emSize * 0.75 } as TextStyle,
    code: {
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 3,
    } as TextStyle,

    // Links
    a: {
      color: '#1a73e8',
      textDecorationLine: 'underline',
    } as TextStyle,

    // Lists
    ul: { marginVertical: 4, paddingLeft: 20 } as ViewStyle,
    ol: { marginVertical: 4, paddingLeft: 20 } as ViewStyle,
    li: { ...base, marginVertical: 2 } as TextStyle,

    // Separators
    hr: {
      marginVertical: 8,
    } as ViewStyle,

    // Preformatted
    pre: {
      ...base,
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      padding: 10,
      borderRadius: 4,
      marginVertical: 6,
    } as TextStyle,

    // Blockquote
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: '#ccc',
      paddingLeft: 12,
      marginVertical: 6,
      marginLeft: 0,
    } as ViewStyle,

    // Tables
    table: { marginVertical: 6 } as ViewStyle,
    th: {
      ...base,
      fontWeight: 'bold',
      padding: 6,
      borderWidth: 1,
      borderColor: '#ddd',
      backgroundColor: '#f9f9f9',
    } as TextStyle,
    td: {
      ...base,
      padding: 6,
      borderWidth: 1,
      borderColor: '#ddd',
    } as TextStyle,
    tr: { flexDirection: 'row' } as ViewStyle,

    // Block containers
    div: {} as ViewStyle,
    section: {} as ViewStyle,
    article: {} as ViewStyle,
    header: {} as ViewStyle,
    footer: {} as ViewStyle,
    main: {} as ViewStyle,
    nav: {} as ViewStyle,
    aside: {} as ViewStyle,

    // Images
    img: {} as ViewStyle,

    // Forms (read-only)
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 6,
      marginVertical: 2,
      ...base,
    } as TextStyle,
    textarea: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 6,
      marginVertical: 2,
      minHeight: 60,
      ...base,
    } as TextStyle,
    button: {
      backgroundColor: '#e0e0e0',
      borderRadius: 4,
      padding: 8,
      marginVertical: 2,
      alignItems: 'center',
    } as ViewStyle,
    select: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 6,
      marginVertical: 2,
      ...base,
    } as TextStyle,

    // Definition lists
    dl: { marginVertical: 4 } as ViewStyle,
    dt: { ...base, fontWeight: 'bold', marginVertical: 2 } as TextStyle,
    dd: { ...base, marginLeft: 20, marginVertical: 2 } as TextStyle,
  };
}
