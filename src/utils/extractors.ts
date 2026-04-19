import { parseDocument } from 'htmlparser2';
import type { DOMNode, DOMElement } from '../types';
import { extractTextContent, isDOMElement } from './index';

interface HP2Node {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: HP2Node[];
}

function parseLoose(input: string | DOMNode[]): DOMNode[] {
  if (Array.isArray(input)) return input;
  const doc = parseDocument(input);
  return convertAll((doc.children ?? []) as HP2Node[]);
}

function convertAll(nodes: HP2Node[]): DOMNode[] {
  const out: DOMNode[] = [];
  for (const n of nodes) {
    if (n.type === 'text') {
      const data = n.data ?? '';
      if (data.length > 0) out.push({ type: 'text', data });
    } else if (n.type === 'tag' && n.name) {
      out.push({
        type: 'element',
        tag: n.name.toLowerCase(),
        attributes: n.attribs ?? {},
        children: convertAll(n.children ?? []),
      });
    }
  }
  return out;
}

/** Extracted link: href + visible text. */
export interface ExtractedLink {
  href: string;
  text: string;
  attributes: Record<string, string>;
}

/** Extract every `<a>` tag from HTML or parsed DOM. */
export function extractLinks(input: string | DOMNode[]): ExtractedLink[] {
  const nodes = parseLoose(input);
  const out: ExtractedLink[] = [];
  const visit = (el: DOMElement) => {
    if (el.tag === 'a' && el.attributes.href) {
      out.push({
        href: el.attributes.href,
        text: extractTextContent(el.children).trim(),
        attributes: el.attributes,
      });
    }
  };
  walkDom(nodes, visit);
  return out;
}

/** Extracted image: src, alt. */
export interface ExtractedImage {
  src: string;
  alt: string;
  attributes: Record<string, string>;
}

/** Extract every `<img>` tag from HTML or parsed DOM. */
export function extractImages(input: string | DOMNode[]): ExtractedImage[] {
  const nodes = parseLoose(input);
  const out: ExtractedImage[] = [];
  const visit = (el: DOMElement) => {
    if (el.tag === 'img' && el.attributes.src) {
      out.push({
        src: el.attributes.src,
        alt: el.attributes.alt ?? '',
        attributes: el.attributes,
      });
    }
  };
  walkDom(nodes, visit);
  return out;
}

function walkDom(nodes: DOMNode[], visit: (el: DOMElement) => void) {
  for (const n of nodes) {
    if (isDOMElement(n)) {
      visit(n);
      walkDom(n.children, visit);
    }
  }
}

/** Convert HTML (or parsed DOM) to plain text with block-level newlines. */
export function htmlToText(input: string | DOMNode[]): string {
  const nodes = parseLoose(input);
  return nodesToText(nodes)
    .trim()
    .replace(/\n{3,}/g, '\n\n');
}

const BLOCK_TAGS = new Set([
  'p',
  'div',
  'section',
  'article',
  'header',
  'footer',
  'aside',
  'main',
  'nav',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'table',
  'tr',
  'pre',
  'hr',
]);

function nodesToText(nodes: DOMNode[]): string {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') {
      out += n.data;
      continue;
    }
    if (n.tag === 'br') {
      out += '\n';
      continue;
    }
    if (n.tag === 'script' || n.tag === 'style' || n.tag === 'head') continue;
    const inner = nodesToText(n.children);
    if (BLOCK_TAGS.has(n.tag)) {
      out += '\n' + inner + '\n';
    } else {
      out += inner;
    }
  }
  return out;
}

/** A single heading entry in a generated table of contents. */
export interface TOCEntry {
  level: number;
  text: string;
  id: string;
}

/** Generate a table of contents from `<h1>` – `<h6>` headings. */
export function generateTOC(input: string | DOMNode[]): TOCEntry[] {
  const nodes = parseLoose(input);
  const out: TOCEntry[] = [];
  const visit = (el: DOMElement) => {
    const m = /^h([1-6])$/.exec(el.tag);
    if (!m) return;
    const level = parseInt(m[1]!, 10);
    const text = extractTextContent(el.children).trim();
    let id = el.attributes.id;
    if (!id) id = slugify(text);
    out.push({ level, text, id });
  };
  walkDom(nodes, visit);
  return out;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
