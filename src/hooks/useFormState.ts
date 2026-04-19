import { useCallback, useRef, useState } from 'react';
import type { FormFieldState, FormState, OnFormChange } from '../types';

export interface UseFormStateResult {
  state: FormState;
  setField: (field: FormFieldState) => void;
}

/**
 * Track form state for the renderer. Supports controlled input via `initial`
 * and emits updates through `onChange`.
 */
export function useFormState(
  initial?: FormState,
  onChange?: OnFormChange
): UseFormStateResult {
  const [state, setState] = useState<FormState>(initial ?? {});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setField = useCallback((field: FormFieldState) => {
    setState((prev) => {
      const next = { ...prev };
      if (field.type === 'radio' && typeof field.value === 'boolean') {
        // Radios: store selected value, not boolean
        if (field.value === true) {
          next[field.name] =
            (field as unknown as { rawValue?: string }).rawValue ?? true;
        }
      } else {
        next[field.name] = field.value as string | boolean;
      }
      onChangeRef.current?.(field, next);
      return next;
    });
  }, []);

  return { state, setField };
}
