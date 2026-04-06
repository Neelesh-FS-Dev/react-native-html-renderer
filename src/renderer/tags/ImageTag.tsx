import { memo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native';
import type {
  DOMElement,
  HtmlRendererContextValue,
  RNStyle,
} from '../../types';
import {
  getCachedImageDimensions,
  setCachedImageDimensions,
} from '../../utils/cache';
import { getImageA11yLabel } from '../../utils/accessibility';

interface ImageTagProps {
  node: DOMElement;
  style: RNStyle;
  nodeKey: string;
  ctx: HtmlRendererContextValue;
}

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Renders an `<img>` tag with:
 * - Cached dimension fetching via `Image.getSize()`
 * - Proportional scaling to fit `contentWidth` / `maxImagesWidth`
 * - Loading placeholder and error fallback
 * - Optional `onImagePress` callback
 * - Accessibility labels from `alt`, `aria-label`, `title`
 */
export const ImageTag = memo(function ImageTag({
  node,
  style,
  nodeKey,
  ctx,
}: ImageTagProps) {
  const src = node.attributes.src;
  if (!src) return null;

  // aria-hidden check
  if (node.attributes['aria-hidden'] === 'true') return null;

  return (
    <ImageInner
      src={src}
      node={node}
      style={style}
      nodeKey={nodeKey}
      ctx={ctx}
    />
  );
});

const ImageInner = memo(function ImageInner({
  src,
  node,
  style,
  nodeKey,
  ctx,
}: ImageTagProps & { src: string }) {
  const attrWidth = parseInt(node.attributes.width ?? '0', 10) || 0;
  const attrHeight = parseInt(node.attributes.height ?? '0', 10) || 0;

  // Check cache first
  const cached = getCachedImageDimensions(src);
  const initialDims =
    attrWidth && attrHeight
      ? { width: attrWidth, height: attrHeight }
      : (cached ?? null);

  const [dimensions, setDimensions] = useState<ImageDimensions | null>(
    initialDims
  );
  const [loading, setLoading] = useState(!initialDims);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (dimensions) return;

    let cancelled = false;

    Image.getSize(
      src,
      (w, h) => {
        if (!cancelled) {
          const dims = { width: w, height: h };
          setDimensions(dims);
          setCachedImageDimensions(src, dims);
          setLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setErrored(true);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [src, dimensions]);

  const handlePress = useCallback(() => {
    ctx.onImagePress?.(src, node.attributes);
  }, [ctx, src, node.attributes]);

  // Calculate scaled dimensions
  const maxWidth = Math.min(
    ctx.contentWidth,
    ctx.maxImagesWidth ?? ctx.contentWidth
  );
  const placeholder = ctx.imagesInitialDimensions;

  let displayWidth: number;
  let displayHeight: number;

  if (dimensions) {
    const ratio = dimensions.height / dimensions.width;
    displayWidth = Math.min(dimensions.width, maxWidth);
    displayHeight = displayWidth * ratio;
  } else {
    displayWidth = Math.min(placeholder.width, maxWidth);
    displayHeight = placeholder.height;
  }

  const a11yLabel = getImageA11yLabel(node);

  if (errored) {
    return (
      <View
        key={nodeKey}
        style={[errorContainer, { width: displayWidth, height: displayHeight }]}
        accessibilityRole="image"
        accessibilityLabel={a11yLabel ?? 'Image failed to load'}
      >
        <Text style={errorText}>Image failed to load</Text>
      </View>
    );
  }

  const imageElement = (
    <View key={nodeKey}>
      {loading && (
        <View
          style={[
            loadingContainer,
            { width: displayWidth, height: displayHeight },
          ]}
        >
          <ActivityIndicator size="small" />
        </View>
      )}
      <Image
        source={{ uri: src }}
        style={[
          { width: displayWidth, height: displayHeight } as ImageStyle,
          style as ImageStyle,
        ]}
        accessibilityRole="image"
        accessibilityLabel={a11yLabel}
        resizeMode="contain"
        onLoad={() => setLoading(false)}
        onError={() => {
          setErrored(true);
          setLoading(false);
        }}
      />
    </View>
  );

  if (ctx.onImagePress) {
    return (
      <TouchableOpacity key={nodeKey} onPress={handlePress} activeOpacity={0.8}>
        {imageElement}
      </TouchableOpacity>
    );
  }

  return imageElement;
});

const loadingContainer: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: 4,
};

const errorContainer: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#ddd',
};

const errorText: TextStyle = {
  color: '#999',
  fontSize: 12,
};
