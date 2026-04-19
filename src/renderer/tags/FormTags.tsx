import { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
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

function fieldName(node: DOMElement, fallback: string): string {
  return node.attributes.name ?? node.attributes.id ?? fallback;
}

/**
 * Interactive input renderer. Checkbox/radio are toggleable; text inputs are
 * editable. Every change emits through `ctx.setFormField` which in turn calls
 * `onFormChange` on the HtmlRenderer.
 */
export const InputTag = memo(function InputTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const type = (node.attributes.type ?? 'text').toLowerCase();
  const name = fieldName(node, `input_${nodeKey}`);
  const a11y = getAccessibilityProps(node);

  // Hooks must run unconditionally — declare state for the text-input branch
  // up-front; checkbox/radio/hidden branches simply ignore it.
  const initial =
    (ctx.formState[name] as string | undefined) ?? node.attributes.value ?? '';
  const [value, setValue] = useState<string>(String(initial));
  const onChangeText = useCallback(
    (text: string) => {
      setValue(text);
      ctx.setFormField({ name, type, value: text });
    },
    [ctx, name, type]
  );

  if (type === 'hidden') return null;

  // --- Checkbox / Radio ---
  if (type === 'checkbox' || type === 'radio') {
    const current = ctx.formState[name];
    let isChecked: boolean;
    if (type === 'checkbox') {
      isChecked =
        current !== undefined ? current === true : 'checked' in node.attributes;
    } else {
      const rawValue = node.attributes.value ?? 'on';
      isChecked =
        current !== undefined
          ? current === rawValue || current === true
          : 'checked' in node.attributes;
    }

    const toggle = () => {
      if (type === 'checkbox') {
        ctx.setFormField({ name, type, value: !isChecked });
      } else {
        const rawValue = node.attributes.value ?? 'on';
        ctx.setFormField({
          name,
          type,
          value: true,
          // stash raw value so hook can store it
          // @ts-expect-error augmented
          rawValue,
        });
      }
    };

    const symbol =
      type === 'checkbox'
        ? isChecked
          ? '\u2611 '
          : '\u2610 '
        : isChecked
          ? '\u25C9 '
          : '\u25CB ';

    return (
      <Pressable
        key={nodeKey}
        onPress={toggle}
        accessibilityRole={type === 'checkbox' ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: isChecked }}
        {...a11y}
      >
        <Text
          style={style as TextStyle}
          allowFontScaling={ctx.allowFontScaling}
          maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
          {...ctx.defaultTextProps}
        >
          {symbol}
        </Text>
      </Pressable>
    );
  }

  // --- Text-like inputs (state declared above to keep hook order stable) ---
  const secure = type === 'password';
  const keyboardType =
    type === 'number'
      ? 'numeric'
      : type === 'email'
        ? 'email-address'
        : type === 'tel'
          ? 'phone-pad'
          : type === 'url'
            ? 'url'
            : 'default';

  return (
    <TextInput
      key={nodeKey}
      style={[inputTextInput, style as TextStyle]}
      value={value}
      onChangeText={onChangeText}
      placeholder={node.attributes.placeholder}
      secureTextEntry={secure}
      keyboardType={keyboardType}
      editable={
        !('disabled' in node.attributes || 'readonly' in node.attributes)
      }
      allowFontScaling={ctx.allowFontScaling}
      maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
      {...a11y}
    />
  );
});

export const TextareaTag = memo(function TextareaTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const name = fieldName(node, `textarea_${nodeKey}`);
  const initial =
    (ctx.formState[name] as string | undefined) ??
    extractTextContent(node.children) ??
    '';
  const [value, setValue] = useState<string>(String(initial));
  const a11y = getAccessibilityProps(node);

  const onChangeText = useCallback(
    (text: string) => {
      setValue(text);
      ctx.setFormField({ name, type: 'textarea', value: text });
    },
    [ctx, name]
  );

  return (
    <TextInput
      key={nodeKey}
      style={[inputTextInput, textareaStyle, style as TextStyle]}
      multiline
      value={value}
      onChangeText={onChangeText}
      placeholder={node.attributes.placeholder}
      editable={
        !('disabled' in node.attributes || 'readonly' in node.attributes)
      }
      allowFontScaling={ctx.allowFontScaling}
      maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
      {...a11y}
    />
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
  const name = fieldName(node, `button_${nodeKey}`);
  const onPress = useCallback(() => {
    ctx.setFormField({ name, type: 'button', value: true });
  }, [ctx, name]);

  return (
    <Pressable
      key={nodeKey}
      onPress={onPress}
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
    </Pressable>
  );
});

export const SelectTag = memo(function SelectTag({
  node,
  style,
  nodeKey,
  ctx,
}: FormTagProps) {
  const name = fieldName(node, `select_${nodeKey}`);
  const options = node.children.filter(
    (c) => c.type === 'element' && c.tag === 'option'
  );
  let initialLabel = '';
  let initialValue: string | undefined;
  for (const opt of options) {
    if (opt.type !== 'element') continue;
    const text = extractTextContent(opt.children);
    const value = opt.attributes.value ?? text;
    if ('selected' in opt.attributes) {
      initialLabel = text;
      initialValue = value;
      break;
    }
    if (!initialLabel) {
      initialLabel = text;
      initialValue = value;
    }
  }
  const current = ctx.formState[name] as string | undefined;
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<{ label: string; value: string }>({
    label: initialLabel,
    value: String(current ?? initialValue ?? ''),
  });
  const a11y = getAccessibilityProps(node);

  const toggle = () => setExpanded((v) => !v);
  const choose = (label: string, value: string) => {
    setSelected({ label, value });
    setExpanded(false);
    ctx.setFormField({ name, type: 'select', value });
  };

  return (
    <View key={nodeKey} style={style as ViewStyle}>
      <Pressable
        onPress={toggle}
        accessibilityRole="combobox"
        accessibilityState={{ expanded }}
        {...a11y}
      >
        <Text
          style={inputText}
          allowFontScaling={ctx.allowFontScaling}
          maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
          {...ctx.defaultTextProps}
        >
          {selected.label || '\u2014'} {expanded ? '\u25B4' : '\u25BE'}
        </Text>
      </Pressable>
      {expanded && (
        <View style={optionListStyle}>
          {options.map((opt, i) => {
            if (opt.type !== 'element') return null;
            const label = extractTextContent(opt.children);
            const value = opt.attributes.value ?? label;
            return (
              <Pressable
                key={`${nodeKey}_opt_${i}`}
                onPress={() => choose(label, value)}
              >
                <Text
                  style={optionItemStyle}
                  allowFontScaling={ctx.allowFontScaling}
                  maxFontSizeMultiplier={ctx.maxFontSizeMultiplier}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
});

const inputText: TextStyle = {
  fontSize: 14,
  color: '#333',
};

const inputTextInput: TextStyle = {
  fontSize: 14,
  color: '#333',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 6,
  minWidth: 60,
};

const textareaStyle: TextStyle = {
  minHeight: 80,
  textAlignVertical: 'top',
};

const buttonText: TextStyle = {
  fontSize: 14,
  color: '#fff',
  fontWeight: '600',
  textAlign: 'center',
};

const optionListStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 4,
  marginTop: 4,
};

const optionItemStyle: TextStyle = {
  fontSize: 14,
  color: '#333',
  paddingHorizontal: 8,
  paddingVertical: 6,
};
