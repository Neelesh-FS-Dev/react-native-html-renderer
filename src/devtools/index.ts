import type { DOMNode, DOMElement } from '../types';
import { extractTextContent, isDOMElement } from '../utils';

// ---------------------------------------------------------------------------
// Tree inspector
// ---------------------------------------------------------------------------

export interface InspectorNode {
  tag?: string;
  type: 'element' | 'text';
  text?: string;
  attributes?: Record<string, string>;
  children?: InspectorNode[];
}

/** Produce a pretty-printable tree of the parsed DOM for debugging. */
export function inspectTree(nodes: DOMNode[]): InspectorNode[] {
  return nodes.map((n) => {
    if (n.type === 'text') {
      return { type: 'text', text: n.data };
    }
    return {
      type: 'element',
      tag: n.tag,
      attributes: n.attributes,
      children: inspectTree(n.children),
    };
  });
}

/** Format an inspector tree as indented text. */
export function formatInspectorTree(
  nodes: InspectorNode[],
  indent = 0
): string {
  const pad = '  '.repeat(indent);
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') {
      const txt = (n.text ?? '').replace(/\s+/g, ' ').trim();
      if (txt) out += `${pad}"${txt}"\n`;
    } else {
      const attrs = n.attributes
        ? Object.entries(n.attributes)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join('')
        : '';
      out += `${pad}<${n.tag}${attrs}>\n`;
      if (n.children && n.children.length) {
        out += formatInspectorTree(n.children, indent + 1);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Performance profiler
// ---------------------------------------------------------------------------

export interface PerfSample {
  label: string;
  durationMs: number;
  startedAt: number;
}

/** Simple high-resolution timer. */
export function profile<T>(
  label: string,
  fn: () => T,
  onSample?: (s: PerfSample) => void
): T {
  const startedAt = Date.now();
  const start = nowMs();
  try {
    return fn();
  } finally {
    const end = nowMs();
    onSample?.({ label, durationMs: end - start, startedAt });
  }
}

function nowMs(): number {
  const g = globalThis as { performance?: { now?: () => number } };
  return g.performance?.now ? g.performance.now() : Date.now();
}

// ---------------------------------------------------------------------------
// Accessibility audit
// ---------------------------------------------------------------------------

export interface A11yWarning {
  rule: string;
  message: string;
  tag: string;
  attributes: Record<string, string>;
}

/** Inspect a parsed DOM for common accessibility issues. */
export function accessibilityAudit(nodes: DOMNode[]): A11yWarning[] {
  const warnings: A11yWarning[] = [];
  const visit = (el: DOMElement) => {
    // <img> without alt
    if (el.tag === 'img' && el.attributes.alt === undefined) {
      warnings.push({
        rule: 'img-alt',
        message: `<img> missing alt attribute`,
        tag: el.tag,
        attributes: el.attributes,
      });
    }
    // <a> with href but empty text
    if (
      el.tag === 'a' &&
      el.attributes.href &&
      extractTextContent(el.children).trim() === '' &&
      !el.attributes['aria-label']
    ) {
      warnings.push({
        rule: 'link-name',
        message: `<a> has no accessible name`,
        tag: el.tag,
        attributes: el.attributes,
      });
    }
    // form inputs without name or label
    if (
      (el.tag === 'input' || el.tag === 'textarea' || el.tag === 'select') &&
      !el.attributes.name &&
      !el.attributes.id &&
      !el.attributes['aria-label']
    ) {
      warnings.push({
        rule: 'form-name',
        message: `<${el.tag}> missing name/id/aria-label`,
        tag: el.tag,
        attributes: el.attributes,
      });
    }
    // heading order
    const m = /^h([1-6])$/.exec(el.tag);
    if (m) {
      const level = parseInt(m[1]!, 10);
      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        warnings.push({
          rule: 'heading-order',
          message: `Heading level skipped: h${lastHeadingLevel} → h${level}`,
          tag: el.tag,
          attributes: el.attributes,
        });
      }
      lastHeadingLevel = level;
    }
  };

  let lastHeadingLevel = 0;
  const walk = (arr: DOMNode[]) => {
    for (const n of arr) {
      if (isDOMElement(n)) {
        visit(n);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return warnings;
}
