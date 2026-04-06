import { memo } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import type {
  DOMElement,
  RNStyle,
  HtmlRendererContextValue,
} from '../../types';
import { extractTextContent } from '../../utils';
import { getAccessibilityProps } from '../../utils/accessibility';

interface FormTagProps {
  node: DOMElement;
  style: RNStyle;
  nodeKey: string;
  ctx: HtmlRendererContextValue;
}

/**
 * Read-only renderers for form elements.
 */
export const InputTag = memo(function InputTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const type = node.attributes.type ?? 'text';
  const value = node.attributes.value ?? node.attributes.placeholder ?? '';
  const a11y = getAccessibilityProps(node);

  if (type === 'hidden') return null;

  if (type === 'checkbox' || type === 'radio') {
    const checked = 'checked' in node.attributes;
    return (
      <Text
        key={nodeKey}
        style={style as TextStyle}
        accessibilityRole={type === 'checkbox' ? 'checkbox' : 'radio'}
        accessibilityState={{ checked }}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {type === 'checkbox'
          ? checked
            ? '\u2611 '
            : '\u2610 '
          : checked
            ? '\u25C9 '
            : '\u25CB '}
      </Text>
    );
  }

  return (
    <View key={nodeKey} style={style as ViewStyle} {...a11y}>
      <Text
        style={inputText}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {value}
      </Text>
    </View>
  );
});

export const TextareaTag = memo(function TextareaTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const text =
    extractTextContent(node.children) || node.attributes.placeholder || '';
  const a11y = getAccessibilityProps(node);

  return (
    <View key={nodeKey} style={style as ViewStyle} {...a11y}>
      <Text
        style={inputText}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {text}
      </Text>
    </View>
  );
});

export const ButtonTag = memo(function ButtonTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const label =
    extractTextContent(node.children) || node.attributes.value || 'Button';

  return (
    <View
      key={nodeKey}
      style={style as ViewStyle}
      accessibilityRole="button"
      accessibilityLabel={node.attributes['aria-label'] ?? label}
    >
      <Text
        style={buttonText}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {label}
      </Text>
    </View>
  );
});

export const SelectTag = memo(function SelectTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const options = node.children.filter(
    (c) => c.type === 'element' && c.tag === 'option'
  );
  let label = '';
  for (const opt of options) {
    if (opt.type === 'element') {
      if ('selected' in opt.attributes) {
        label = extractTextContent(opt.children);
        break;
      }
      if (!label) {
        label = extractTextContent(opt.children);
      }
    }
  }
  const a11y = getAccessibilityProps(node);

  return (
    <View key={nodeKey} style={style as ViewStyle} {...a11y}>
      <Text
        style={inputText}
        allowFontScaling={ctx.allowFontScaling}
        maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
        {...ctx.defaultTextProps}
      >
        {label || '\u2014'}
      </Text>
    </View>
  );
});

const inputText: TextStyle = {
  fontSize: 14,
  color: '#333',
};

const buttonText: TextStyle = {
  fontSize: 14,
  color: '#fff',
  fontWeight: '600',
  textAlign: 'center',
};
