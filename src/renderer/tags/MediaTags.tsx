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

const audioHeightStyle: ViewStyle = {
  height: 48,
};

/**
 * `<video>` renderer. Delegates to `ctx.videoRenderer` if provided, otherwise
 * renders a placeholder. Users can wire `expo-video` or `react-native-video`
 * via the `videoRenderer` prop on HtmlRenderer.
 */
export const VideoTag = memo(function VideoTag({
  node,
  style,
  nodeKey,
  ctx,
}: MediaTagProps) {
  if (ctx.videoRenderer) {
    const result = ctx.videoRenderer({
      node,
      children: [],
      style,
      attributes: node.attributes,
      passProps: ctx.renderersProps.video ?? {},
      renderChildren: () => [],
      contentWidth: ctx.contentWidth,
    });
    return <View key={nodeKey}>{result}</View>;
  }

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

/**
 * `<audio>` renderer. Delegates to `ctx.audioRenderer` if provided.
 */
export const AudioTag = memo(function AudioTag({
  node,
  style,
  nodeKey,
  ctx,
}: MediaTagProps) {
  if (ctx.audioRenderer) {
    const result = ctx.audioRenderer({
      node,
      children: [],
      style,
      attributes: node.attributes,
      passProps: ctx.renderersProps.audio ?? {},
      renderChildren: () => [],
      contentWidth: ctx.contentWidth,
    });
    return <View key={nodeKey}>{result}</View>;
  }

  const label = node.attributes['aria-label'] ?? 'Audio content';

  return (
    <View
      key={nodeKey}
      style={[placeholderStyle, style as ViewStyle, audioHeightStyle]}
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
