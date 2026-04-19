import { memo } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import type {
  DOMElement,
  DOMNode,
  HtmlRendererContextValue,
  RNStyle,
} from '../../types';

interface SvgTagProps {
  node: DOMElement;
  style: RNStyle;
  nodeKey: string;
  ctx: HtmlRendererContextValue;
}

function parseViewBox(vb: string | undefined): {
  x: number;
  y: number;
  w: number;
  h: number;
} | null {
  if (!vb) return null;
  const parts = vb
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  return { x: parts[0]!, y: parts[1]!, w: parts[2]!, h: parts[3]! };
}

function num(v: string | undefined, fallback = 0): number {
  if (v === undefined) return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

/**
 * Minimal SVG renderer.
 *
 * Supports `<rect>`, `<circle>`, `<line>` (as thin views), and `<text>`.
 * Maps shapes to absolutely-positioned Views inside a container sized to
 * `width`/`height` or `viewBox`. For full SVG rendering (paths, gradients),
 * pass a `svgRenderer` prop using `react-native-svg` or similar.
 */
export const SvgTag = memo(function SvgTag({
  node,
  style,
  nodeKey,
  ctx,
}: SvgTagProps) {
  // Delegate to user-provided renderer if available
  if (ctx.svgRenderer) {
    const result = ctx.svgRenderer({
      node,
      children: [],
      style,
      attributes: node.attributes,
      passProps: ctx.renderersProps.svg ?? {},
      renderChildren: () => [],
      contentWidth: ctx.contentWidth,
    });
    return <View key={nodeKey}>{result}</View>;
  }

  const vb = parseViewBox(node.attributes.viewBox);
  const width = num(node.attributes.width, vb?.w ?? 100);
  const height = num(node.attributes.height, vb?.h ?? 100);
  const scaleX = vb ? width / vb.w : 1;
  const scaleY = vb ? height / vb.h : 1;
  const offX = vb ? -vb.x * scaleX : 0;
  const offY = vb ? -vb.y * scaleY : 0;

  const shapes = collectShapes(node.children);

  return (
    <View
      key={nodeKey}
      style={[{ width, height } as ViewStyle, style as ViewStyle]}
      accessibilityRole="image"
      accessibilityLabel={node.attributes['aria-label'] ?? 'SVG graphic'}
    >
      {shapes.map((s, i) =>
        renderShape(s, `${nodeKey}_s_${i}`, scaleX, scaleY, offX, offY)
      )}
    </View>
  );
});

function collectShapes(nodes: DOMNode[]): DOMElement[] {
  const out: DOMElement[] = [];
  for (const n of nodes) {
    if (n.type !== 'element') continue;
    if (
      ['rect', 'circle', 'line', 'text', 'polygon', 'ellipse', 'g'].includes(
        n.tag
      )
    ) {
      if (n.tag === 'g') out.push(...collectShapes(n.children));
      else out.push(n);
    }
  }
  return out;
}

function renderShape(
  el: DOMElement,
  key: string,
  sx: number,
  sy: number,
  ox: number,
  oy: number
) {
  const fill = el.attributes.fill ?? '#000';
  const stroke = el.attributes.stroke;
  const strokeWidth = num(el.attributes['stroke-width'], 0);

  if (el.tag === 'rect') {
    const x = num(el.attributes.x) * sx + ox;
    const y = num(el.attributes.y) * sy + oy;
    const w = num(el.attributes.width) * sx;
    const h = num(el.attributes.height) * sy;
    const rx = num(el.attributes.rx);
    const style: ViewStyle = {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      backgroundColor: fill === 'none' ? 'transparent' : fill,
      borderRadius: rx,
      borderWidth: stroke ? strokeWidth : 0,
      borderColor: stroke,
    };
    return <View key={key} style={style} />;
  }

  if (el.tag === 'circle') {
    const cx = num(el.attributes.cx) * sx + ox;
    const cy = num(el.attributes.cy) * sy + oy;
    const r = num(el.attributes.r) * Math.min(sx, sy);
    const style: ViewStyle = {
      position: 'absolute',
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      backgroundColor: fill === 'none' ? 'transparent' : fill,
      borderWidth: stroke ? strokeWidth : 0,
      borderColor: stroke,
    };
    return <View key={key} style={style} />;
  }

  if (el.tag === 'ellipse') {
    const cx = num(el.attributes.cx) * sx + ox;
    const cy = num(el.attributes.cy) * sy + oy;
    const rx = num(el.attributes.rx) * sx;
    const ry = num(el.attributes.ry) * sy;
    const style: ViewStyle = {
      position: 'absolute',
      left: cx - rx,
      top: cy - ry,
      width: rx * 2,
      height: ry * 2,
      borderRadius: Math.max(rx, ry),
      backgroundColor: fill === 'none' ? 'transparent' : fill,
      borderWidth: stroke ? strokeWidth : 0,
      borderColor: stroke,
    };
    return <View key={key} style={style} />;
  }

  if (el.tag === 'line') {
    const x1 = num(el.attributes.x1) * sx + ox;
    const y1 = num(el.attributes.y1) * sy + oy;
    const x2 = num(el.attributes.x2) * sx + ox;
    const y2 = num(el.attributes.y2) * sy + oy;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const thickness = Math.max(1, strokeWidth);
    const style: ViewStyle = {
      position: 'absolute',
      left: x1,
      top: y1 - thickness / 2,
      width: length,
      height: thickness,
      backgroundColor: stroke ?? '#000',
      transform: [{ translateX: 0 }, { rotate: `${angle}deg` }],
      transformOrigin: '0% 50%',
    };
    return <View key={key} style={style} />;
  }

  if (el.tag === 'text') {
    const x = num(el.attributes.x) * sx + ox;
    const y = num(el.attributes.y) * sy + oy;
    const fontSize = num(el.attributes['font-size'], 12) * Math.min(sx, sy);
    const text = el.children
      .map((c) => (c.type === 'text' ? c.data : ''))
      .join('');
    const style: TextStyle = {
      position: 'absolute',
      left: x,
      top: y - fontSize,
      color: fill,
      fontSize,
    };
    return (
      <Text key={key} style={style}>
        {text}
      </Text>
    );
  }

  return null;
}
