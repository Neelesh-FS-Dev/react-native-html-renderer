import { memo, useCallback, type ReactNode } from 'react';
import { Text, TouchableOpacity, Linking, type TextStyle } from 'react-native';
import type { DOMNode, RNStyle, HtmlRendererContextValue } from '../../types';
import { isInlineContent } from '../../utils';
import { getLinkA11yLabel } from '../../utils/accessibility';
import { renderInlineNodes } from './TextTags';

/** Only allow these URL schemes in the default Linking.openURL handler. */
const SAFE_LINK_SCHEMES = /^(https?:|mailto:|tel:|sms:)/i;

interface LinkTagProps {
  node: {
    attributes: Record<string, string>;
    children: DOMNode[];
  };
  style: RNStyle;
  nodeKey: string;
  ctx: HtmlRendererContextValue;
  renderNodes: (
    nodes: DOMNode[],
    ctx: HtmlRendererContextValue,
    keyPrefix: string
  ) => ReactNode[];
}

/**
 * Renders a block-level `<a>` tag as a TouchableOpacity wrapping a Text.
 * Includes accessibility role, label, and hint.
 */
export const LinkTag = memo(function LinkTag({
  node,
  style,
  nodeKey,
  ctx,
  renderNodes,
}: LinkTagProps) {
  const href = node.attributes.href ?? '';

  const handlePress = useCallback(() => {
    if (ctx.onLinkPress) {
      ctx.onLinkPress(href, node.attributes);
    } else if (SAFE_LINK_SCHEMES.test(href)) {
      Linking.openURL(href).catch(() => {
        // silently ignore if URL can't be opened
      });
    }
  }, [ctx, href, node.attributes]);

  const children = isInlineContent(node.children)
    ? renderInlineNodes(node.children, ctx, nodeKey, renderNodes)
    : renderNodes(node.children, ctx, nodeKey);

  const a11yLabel =
    node.attributes['aria-label'] ??
    getLinkA11yLabel(node as Parameters<typeof getLinkA11yLabel>[0]);

  return (
    <TouchableOpacity
      key={nodeKey}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel}
      accessibilityHint={href ? `Opens ${href}` : undefined}
      activeOpacity={0.7}
    >
      <Text
        style={style as TextStyle}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
});
