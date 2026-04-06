import { memo, type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import type {
  DOMNode,
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';
import { getAccessibilityProps } from '../../utils/accessibility';

interface BlockTagProps {
  node: DOMElement;
  style: RNStyle;
  children: DOMNode[];
  nodeKey: string;
  ctx: HtmlRendererContextValue;
  renderNodes: (
    nodes: DOMNode[],
    ctx: HtmlRendererContextValue,
    keyPrefix: string
  ) => ReactNode[];
}

/**
 * Generic block-level tag renderer.
 * Used for `<div>`, `<section>`, `<article>`, `<header>`, `<footer>`,
 * `<main>`, `<nav>`, `<aside>`, `<blockquote>`, `<figure>`, etc.
 */
export const BlockTag = memo(function BlockTag({
  node,
  style,
  children,
  nodeKey,
  ctx,
  renderNodes,
}: BlockTagProps) {
  const a11y = getAccessibilityProps(node);

  return (
    <View
      key={nodeKey}
      style={style as ViewStyle}
      {...a11y}
      {...ctx.defaultViewProps}
    >
      {renderNodes(children, ctx, nodeKey)}
    </View>
  );
});
