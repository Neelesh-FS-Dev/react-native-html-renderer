import { memo, type ReactNode } from 'react';
import { View, ScrollView, type ViewStyle } from 'react-native';
import type {
  DOMNode,
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';
import { isDOMElement } from '../../utils';

interface TableTagProps {
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
 * Renders a `<table>` wrapped in a horizontal ScrollView for overflow.
 */
export const TableTag = memo(function TableTag({
  node,
  style,
  nodeKey,
  ctx,
  renderNodes,
}: TableTagProps) {
  return (
    <ScrollView
      key={nodeKey}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style as ViewStyle}
    >
      <View>
        {renderTableContent(
          node.children,
          ctx,
          keyPrefix(nodeKey),
          renderNodes
        )}
      </View>
    </ScrollView>
  );
});

function keyPrefix(k: string): string {
  return `${k}_tbl`;
}

function renderTableContent(
  nodes: DOMNode[],
  ctx: HtmlRendererContextValue,
  prefix: string,
  renderNodes: (
    nodes: DOMNode[],
    ctx: HtmlRendererContextValue,
    keyPrefix: string
  ) => ReactNode[]
): ReactNode[] {
  const results: ReactNode[] = [];

  for (const [i, node] of nodes.entries()) {
    if (!isDOMElement(node)) continue;
    const key = `${prefix}_${i}`;

    if (
      node.tag === 'thead' ||
      node.tag === 'tbody' ||
      node.tag === 'tfoot' ||
      node.tag === 'colgroup' ||
      node.tag === 'caption'
    ) {
      results.push(...renderTableContent(node.children, ctx, key, renderNodes));
    } else if (node.tag === 'tr') {
      results.push(
        <View key={key} style={trStyle}>
          {renderNodes(node.children, ctx, key)}
        </View>
      );
    }
  }

  return results;
}

const trStyle: ViewStyle = {
  flexDirection: 'row',
};
