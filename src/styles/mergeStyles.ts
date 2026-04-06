import type {
  RNStyle,
  TagsStyles,
  ClassesStyles,
  IdsStyles,
  DOMElement,
} from '../types';
import { parseInlineStyle } from './cssToRn';

/**
 * Merge all style layers for a given DOM element in the correct cascade order:
 *
 *   defaultTagStyle → tagsStyles → classesStyles → idsStyles → inline style
 *
 * Later layers override earlier ones.
 */
export function mergeStylesForElement(
  node: DOMElement,
  defaultStyles: TagsStyles,
  tagsStyles: TagsStyles,
  classesStyles: ClassesStyles,
  idsStyles: IdsStyles,
  ignoredStyles?: Set<string>,
  allowedStyles?: Set<string> | null
): RNStyle {
  // 1. Default tag style
  const base: RNStyle = (defaultStyles[node.tag] as RNStyle) ?? {};

  // 2. User tag override
  const tagOverride: RNStyle = (tagsStyles[node.tag] as RNStyle) ?? {};

  // 3. Class-based styles
  let classStyle: RNStyle = {};
  const className = node.attributes.class;
  if (className) {
    const classes = className.split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      const s = classesStyles[cls];
      if (s) classStyle = { ...classStyle, ...s } as RNStyle;
    }
  }

  // 4. ID-based style
  const id = node.attributes.id;
  const idStyle: RNStyle = id ? ((idsStyles[id] as RNStyle) ?? {}) : {};

  // 5. Inline style
  const inlineStyle = node.attributes.style
    ? parseInlineStyle(node.attributes.style, ignoredStyles, allowedStyles)
    : {};

  return {
    ...base,
    ...tagOverride,
    ...classStyle,
    ...idStyle,
    ...inlineStyle,
  } as RNStyle;
}
