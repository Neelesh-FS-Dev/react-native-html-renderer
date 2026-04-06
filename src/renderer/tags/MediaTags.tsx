import { memo } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import type {
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';

interface MediaTagProps {
  node: DOMElement;
  style: RNStyle;
  nodeKey: string;
  ctx: HtmlRendererContextValue;
}

/**
 * Placeholder renderers for `<video>` and `<audio>` tags.
 */
export const VideoTag = memo(function VideoTag({
  node,
  style,
  nodeKey,
  ctx,
}: MediaTagProps) {
  const width = Math.min(ctx.contentWidth, 320);
  const label = node.attributes['aria-label'] ?? 'Video content';

  return (
    <View
      key={nodeKey}
      style={[
        placeholderStyle,
        style as ViewStyle,
        { width, height: width * 0.5625 },
      ]}
      accessibilityLabel={label}
    >
      <Text style={iconStyle}>{'\u25B6'}</Text>
      <Text style={labelStyle}>Video</Text>
    </View>
  );
});

export const AudioTag = memo(function AudioTag({
  node,
  style,
  nodeKey,
}: MediaTagProps) {
  const label = node.attributes['aria-label'] ?? 'Audio content';

  return (
    <View
      key={nodeKey}
      style={[placeholderStyle, style as ViewStyle, { height: 48 }]}
      accessibilityLabel={label}
    >
      <Text style={iconStyle}>{'\u266B'}</Text>
      <Text style={labelStyle}>Audio</Text>
    </View>
  );
});

const placeholderStyle: ViewStyle = {
  backgroundColor: '#f0f0f0',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 4,
  flexDirection: 'row',
  gap: 6,
};

const iconStyle: TextStyle = {
  fontSize: 20,
  color: '#999',
};

const labelStyle: TextStyle = {
  fontSize: 13,
  color: '#999',
};
