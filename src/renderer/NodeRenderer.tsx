import { Fragment, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import type {
  DOMNode,
  DOMElement,
  HtmlRendererContextValue,
  RNStyle,
} from '../types';
import { getDefaultTagStyles, mergeStylesForElement } from '../styles';
import { resolveGridLayout } from '../styles/grid';
import { INLINE_TAGS, TEXT_BLOCK_TAGS, isInlineContent } from '../utils';
import { getAccessibilityProps } from '../utils/accessibility';
import {
  TextBlock,
  renderInlineNodes,
  ImageTag,
  LinkTag,
  ListTag,
  TableTag,
  BlockTag,
  InputTag,
  TextareaTag,
  ButtonTag,
  SelectTag,
  VideoTag,
  AudioTag,
  SvgTag,
} from './tags';

/**
 * Recursively render an array of DOMNodes into React Native components.
 */
export function renderNodes(
  nodes: DOMNode[],
  ctx: HtmlRendererContextValue,
  keyPrefix: string
): ReactNode[] {
  const defaults = getDefaultTagStyles(ctx.emSize);

  return nodes
    .map((node, index) => {
      const key = `${keyPrefix}_${index}`;

      // --- Text node ---
      if (node.type === 'text') {
        return (
          <Text
            key={key}
            allowFontScaling={ctx.allowFontScaling}
            maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
            {...ctx.defaultTextProps}
          >
            {node.data}
          </Text>
        );
      }

      if (node.type !== 'element') return null;

      // --- Ignored tags ---
      if (ctx.ignoredTags.has(node.tag)) return null;

      // --- Compute merged style ---
      const style = mergeStylesForElement(
        node,
        defaults,
        ctx.tagsStyles,
        ctx.classesStyles,
        ctx.idsStyles,
        ctx.ignoredStyles.size > 0 ? ctx.ignoredStyles : undefined,
        ctx.allowedStyles
      );

      // --- Debug logging ---
      if (ctx.debug) {
        console.log(`[HtmlRenderer] <${node.tag}>`, {
          attributes: node.attributes,
          style,
        });
      }

      // --- Custom renderer ---
      const customRenderer = ctx.customRenderers[node.tag];
      if (customRenderer) {
        try {
          const passProps = ctx.renderersProps[node.tag] ?? {};
          const result = customRenderer({
            node,
            children: renderNodes(node.children, ctx, key),
            style,
            attributes: node.attributes,
            passProps,
            renderChildren: (childNodes) => renderNodes(childNodes, ctx, key),
            contentWidth: ctx.contentWidth,
          });
          return <Fragment key={key}>{result}</Fragment>;
        } catch (e) {
          if (ctx.debug) {
            console.error(
              `[HtmlRenderer] Custom renderer for <${node.tag}> threw:`,
              e
            );
          }
          return null;
        }
      }

      // --- Built-in tag handling ---
      try {
        return renderElement(node, style, key, ctx);
      } catch (e) {
        if (ctx.debug) {
          console.error(`[HtmlRenderer] Error rendering <${node.tag}>:`, e);
        }
        return null;
      }
    })
    .filter((n) => n != null);
}

function renderElement(
  node: DOMElement,
  style: RNStyle,
  key: string,
  ctx: HtmlRendererContextValue
): ReactNode {
  const { tag } = node;
  const a11y = getAccessibilityProps(node);

  // Debug: red border around every node
  const debugStyle: ViewStyle | undefined = ctx.debug
    ? { borderWidth: 1, borderColor: 'red' }
    : undefined;

  // Self-closing tags
  if (tag === 'br') {
    return (
      <Text
        key={key}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {'\n'}
      </Text>
    );
  }

  if (tag === 'hr') {
    return (
      <View
        key={key}
        style={[hrBaseStyle, style as ViewStyle, debugStyle]}
        {...a11y}
      />
    );
  }

  // Image
  if (tag === 'img') {
    return (
      <ImageTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }

  // Link (block-level — inline links handled in renderInlineNodes)
  if (tag === 'a') {
    return (
      <LinkTag
        key={key}
        node={node}
        style={style}
        nodeKey={key}
        ctx={ctx}
        renderNodes={renderNodes}
      />
    );
  }

  // Lists
  if (tag === 'ul' || tag === 'ol') {
    return (
      <ListTag
        key={key}
        node={node}
        style={style}
        nodeKey={key}
        ctx={ctx}
        renderNodes={renderNodes}
      />
    );
  }

  // Table
  if (tag === 'table') {
    return (
      <TableTag
        key={key}
        node={node}
        style={style}
        nodeKey={key}
        ctx={ctx}
        renderNodes={renderNodes}
      />
    );
  }

  // Table row
  if (tag === 'tr') {
    return (
      <View key={key} style={[style as ViewStyle, rowStyle]} {...a11y}>
        {renderNodes(node.children, ctx, key)}
      </View>
    );
  }

  // Form elements (read-only)
  if (tag === 'input') {
    return (
      <InputTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }
  if (tag === 'textarea') {
    return (
      <TextareaTag
        key={key}
        node={node}
        style={style}
        nodeKey={key}
        ctx={ctx}
      />
    );
  }
  if (tag === 'button') {
    return (
      <ButtonTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }
  if (tag === 'select') {
    return (
      <SelectTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }

  // Media placeholders
  if (tag === 'video') {
    return (
      <VideoTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }
  if (tag === 'audio') {
    return (
      <AudioTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }

  // Inline SVG
  if (tag === 'svg') {
    return (
      <SvgTag key={key} node={node} style={style} nodeKey={key} ctx={ctx} />
    );
  }

  // CSS Grid simulation on any block-level container
  const gridLayout = resolveGridLayout(
    node.attributes.style,
    node.children.length
  );
  if (gridLayout.container && node.children.length > 0) {
    return (
      <View
        key={key}
        style={[style as ViewStyle, gridLayout.container]}
        {...a11y}
      >
        {renderNodes(node.children, ctx, key).map((child, i) => (
          <View
            key={`${key}_gc_${i}`}
            style={[
              gridCellStyle,
              {
                flexBasis: `${gridLayout.childFlexBasisPct!}%`,
              },
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    );
  }

  // Inline tags at top level — wrap in Text
  if (INLINE_TAGS.has(tag)) {
    return (
      <Text
        key={key}
        style={
          debugStyle ? [style as TextStyle, debugStyle] : (style as TextStyle)
        }
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...a11y}
        {...ctx.defaultTextProps}
      >
        {renderInlineNodes(node.children, ctx, key, renderNodes)}
      </Text>
    );
  }

  // Text-block tags (p, h1-h6, li, td, th, pre, label)
  if (TEXT_BLOCK_TAGS.has(tag)) {
    return (
      <TextBlock
        key={key}
        tag={tag}
        node={node}
        style={style}
        children={node.children}
        nodeKey={key}
        ctx={ctx}
        renderNodes={renderNodes}
      />
    );
  }

  // Unknown tag — log warning in debug mode
  if (ctx.debug) {
    console.warn(`[HtmlRenderer] Unknown tag <${tag}>, rendering children.`);
  }

  // Unknown / generic block elements — render children, never crash
  if (node.children.length === 0) {
    return null;
  }

  // If all children are inline, render as text
  if (isInlineContent(node.children)) {
    return (
      <Text
        key={key}
        style={
          debugStyle ? [style as TextStyle, debugStyle] : (style as TextStyle)
        }
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...a11y}
        {...ctx.defaultTextProps}
      >
        {renderInlineNodes(node.children, ctx, key, renderNodes)}
      </Text>
    );
  }

  // Otherwise render as a block container
  return (
    <BlockTag
      key={key}
      node={node}
      style={debugStyle ? ({ ...style, ...debugStyle } as RNStyle) : style}
      children={node.children}
      nodeKey={key}
      ctx={ctx}
      renderNodes={renderNodes}
    />
  );
}

const hrBaseStyle: ViewStyle = {
  width: '100%',
  height: StyleSheet.hairlineWidth,
  backgroundColor: '#ccc',
};

const rowStyle: ViewStyle = {
  flexDirection: 'row',
};

const gridCellStyle: ViewStyle = {
  flexShrink: 1,
};
