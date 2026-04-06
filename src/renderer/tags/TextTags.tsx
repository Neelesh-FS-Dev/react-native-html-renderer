import { memo, type ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';
import type {
  DOMNode,
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';
import { INLINE_TAGS, isInlineContent } from '../../utils';
import { getAccessibilityProps } from '../../utils/accessibility';

interface TextBlockProps {
  tag: string;
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
 * Renders a text-block tag (`<p>`, `<h1>`-`<h6>`, `<pre>`, `<label>`, etc.)
 * as a single `<Text>` component.
 */
export const TextBlock = memo(function TextBlock({
  node,
  style,
  children,
  nodeKey,
  ctx,
  renderNodes,
}: TextBlockProps) {
  const content = isInlineContent(children)
    ? renderInlineNodes(children, ctx, nodeKey, renderNodes)
    : renderNodes(children, ctx, nodeKey);

  const a11y = getAccessibilityProps(node);
  const debugStyle: TextStyle | undefined = ctx.debug
    ? { borderWidth: 1, borderColor: 'red' }
    : undefined;

  return (
    <Text
      key={nodeKey}
      style={
        debugStyle ? [style as TextStyle, debugStyle] : (style as TextStyle)
      }
      allowFontScaling={ctx.allowFontScaling}
      maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
      {...a11y}
      {...ctx.defaultTextProps}
    >
      {content}
    </Text>
  );
});

/**
 * Renders inline content (text nodes + inline tags) as nested `<Text>` elements.
 */
export function renderInlineNodes(
  nodes: DOMNode[],
  ctx: HtmlRendererContextValue,
  keyPrefix: string,
  renderNodes: (
    nodes: DOMNode[],
    ctx: HtmlRendererContextValue,
    keyPrefix: string
  ) => ReactNode[]
): ReactNode[] {
  return nodes
    .map((node, i) => {
      const key = `${keyPrefix}_${i}`;

      if (node.type === 'text') {
        return node.data;
      }

      if (node.type === 'element' && INLINE_TAGS.has(node.tag)) {
        if (node.tag === 'br') {
          return '\n';
        }

        if (node.tag === 'a') {
          const href = node.attributes.href ?? '';
          const linkStyle: TextStyle = {
            color: '#1a73e8',
            textDecorationLine: 'underline' as const,
            ...(ctx.tagsStyles.a as TextStyle),
          };
          return (
            <Text
              key={key}
              style={linkStyle}
              onPress={() => ctx.onLinkPress?.(href, node.attributes)}
              accessibilityRole="link"
              accessibilityHint={`Opens ${href}`}
              accessibilityLabel={node.attributes['aria-label'] ?? undefined}
              allowFontScaling={ctx.allowFontScaling}
              maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
            >
              {renderInlineNodes(node.children, ctx, key, renderNodes)}
            </Text>
          );
        }

        const inlineStyle: RNStyle = {
          ...(ctx.tagsStyles[node.tag] as TextStyle),
        };

        // Check aria-hidden
        const ariaHidden = node.attributes['aria-hidden'] === 'true';

        return (
          <Text
            key={key}
            style={inlineStyle as TextStyle}
            accessible={ariaHidden ? false : undefined}
            importantForAccessibility={
              ariaHidden ? 'no-hide-descendants' : undefined
            }
            allowFontScaling={ctx.allowFontScaling}
            maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
          >
            {renderInlineNodes(node.children, ctx, key, renderNodes)}
          </Text>
        );
      }

      // Non-inline child — fall back
      return renderNodes([node], ctx, key);
    })
    .filter((n) => n != null);
}
