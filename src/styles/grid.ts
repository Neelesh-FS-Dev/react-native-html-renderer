import type { ViewStyle } from 'react-native';

/**
 * Return container + child style overrides that approximate CSS Grid using
 * flexbox when `display: grid` + `grid-template-columns: repeat(N, 1fr)` is
 * present on the inline style.
 */
export function resolveGridLayout(
  inlineStyle: string | undefined,
  _childCount: number
): {
  container?: ViewStyle;
  childFlexBasisPct?: number;
} {
  if (!inlineStyle) return {};
  const s = inlineStyle.toLowerCase();
  if (!s.includes('display: grid') && !s.includes('display:grid')) return {};

  // grid-template-columns: repeat(N, 1fr)
  const repeatMatch = /grid-template-columns\s*:\s*repeat\(\s*(\d+)/.exec(s);
  let cols = repeatMatch ? parseInt(repeatMatch[1]!, 10) : 0;

  // grid-template-columns: 1fr 1fr 1fr
  if (!cols) {
    const listMatch = /grid-template-columns\s*:\s*([^;]+)/.exec(s);
    if (listMatch) {
      cols = listMatch[1]!.trim().split(/\s+/).length;
    }
  }

  if (!cols || cols < 1) return {};
  const gapMatch = /(?:grid-)?gap\s*:\s*(\d+)/.exec(s);
  const gap = gapMatch ? parseInt(gapMatch[1]!, 10) : 0;

  return {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
    },
    childFlexBasisPct:
      100 / cols - (gap > 0 ? (gap * (cols - 1)) / cols / 10 : 0),
  };
}
