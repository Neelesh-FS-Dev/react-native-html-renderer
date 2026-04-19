import type {
  MediaQueryBreakpoint,
  TagsStyles,
  ClassesStyles,
  IdsStyles,
} from '../types';

export interface ResolvedMediaStyles {
  tagsStyles: TagsStyles;
  classesStyles: ClassesStyles;
  idsStyles: IdsStyles;
}

/**
 * Merge every media-query breakpoint whose condition matches the given width.
 * Breakpoints later in the array override earlier ones (cascade order).
 */
export function resolveMediaQueries(
  breakpoints: MediaQueryBreakpoint[] | undefined,
  width: number
): ResolvedMediaStyles {
  const out: ResolvedMediaStyles = {
    tagsStyles: {},
    classesStyles: {},
    idsStyles: {},
  };
  if (!breakpoints) return out;
  for (const bp of breakpoints) {
    if (bp.minWidth !== undefined && width < bp.minWidth) continue;
    if (bp.maxWidth !== undefined && width > bp.maxWidth) continue;
    if (bp.tagsStyles) {
      for (const [tag, s] of Object.entries(bp.tagsStyles)) {
        out.tagsStyles[tag] = { ...(out.tagsStyles[tag] ?? {}), ...s };
      }
    }
    if (bp.classesStyles) {
      for (const [cls, s] of Object.entries(bp.classesStyles)) {
        out.classesStyles[cls] = { ...(out.classesStyles[cls] ?? {}), ...s };
      }
    }
    if (bp.idsStyles) {
      for (const [id, s] of Object.entries(bp.idsStyles)) {
        out.idsStyles[id] = { ...(out.idsStyles[id] ?? {}), ...s };
      }
    }
  }
  return out;
}
