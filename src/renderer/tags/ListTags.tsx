import { memo, type ReactNode } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import type {
  DOMNode,
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';
import { isInlineContent, isDOMElement } from '../../utils';
import { mergeStylesForElement } from '../../styles';
import { getDefaultTagStyles } from '../../styles/defaultStyles';
import { getAccessibilityProps } from '../../utils/accessibility';
import { renderInlineNodes } from './TextTags';

interface ListTagProps {
  node: DOMElement;
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
 * Renders `<ul>` and `<ol>` lists with proper bullets/numbers and nesting.
 */
export const ListTag = memo(function ListTag({
  node,
  style,
  nodeKey,
  ctx,
  renderNodes,
}: ListTagProps) {
  const isOrdered = node.tag === 'ol';
  const defaults = getDefaultTagStyles(ctx.emSize);
  const nestedCtx = { ...ctx, nestLevel: ctx.nestLevel + 1 };
  const a11y = getAccessibilityProps(node);

  const listItems = node.children.filter(
    (child): child is DOMElement => isDOMElement(child) && child.tag === 'li'
  );

  return (
    <View
      key={nodeKey}
      style={style as ViewStyle}
      accessibilityRole="list"
      {...a11y}
      {...ctx.defaultViewProps}
    >
      {listItems.map((li, liIndex) => {
        const liKey = `${nodeKey}_li_${liIndex}`;
        const liStyle = mergeStylesForElement(
          li,
          defaults,
          ctx.tagsStyles,
          ctx.classesStyles,
          ctx.idsStyles,
          ctx.ignoredStyles.size > 0 ? ctx.ignoredStyles : undefined,
          ctx.allowedStyles
        );

        const prefixRenderer = isOrdered
          ? ctx.listsPrefixesRenderers?.ol
          : ctx.listsPrefixesRenderers?.ul;

        const prefix = prefixRenderer ? (
          prefixRenderer({ index: liIndex, nestLevel: ctx.nestLevel })
        ) : (
          <Text style={bulletStyle}>
            {isOrdered ? `${liIndex + 1}. ` : '\u2022 '}
          </Text>
        );

        const hasNestedList = li.children.some(
          (c) => isDOMElement(c) && (c.tag === 'ul' || c.tag === 'ol')
        );

        if (hasNestedList) {
          const inlineChildren: DOMNode[] = [];
          const blockChildren: DOMNode[] = [];

          for (const child of li.children) {
            if (
              isDOMElement(child) &&
              (child.tag === 'ul' || child.tag === 'ol')
            ) {
              blockChildren.push(child);
            } else {
              inlineChildren.push(child);
            }
          }

          return (
            <View key={liKey}>
              <View style={liRowStyle}>
                {prefix}
                <Text
                  style={[liStyle as TextStyle, { flex: 1 }]}
                  allowFontScaling={ctx.allowFontScaling}
                  maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
                  {...ctx.defaultTextProps}
                >
                  {isInlineContent(inlineChildren)
                    ? renderInlineNodes(inlineChildren, ctx, liKey, renderNodes)
                    : renderNodes(inlineChildren, ctx, liKey)}
                </Text>
              </View>
              {renderNodes(blockChildren, nestedCtx, `${liKey}_nested`)}
            </View>
          );
        }

        const liChildren = isInlineContent(li.children)
          ? renderInlineNodes(li.children, ctx, liKey, renderNodes)
          : renderNodes(li.children, ctx, liKey);

        return (
          <View key={liKey} style={liRowStyle}>
            {prefix}
            <Text
              style={[liStyle as TextStyle, { flex: 1 }]}
              allowFontScaling={ctx.allowFontScaling}
              maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
              {...ctx.defaultTextProps}
            >
              {liChildren}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const liRowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
};

const bulletStyle: TextStyle = {
  width: 20,
  textAlign: 'right',
  marginRight: 4,
};
