import {
  type ContentNode,
  type HeadingTag,
  type TextFormat,
  type MediaItem,
  TextNode,
  LinkNode,
  LinebreakNode,
  ImageNode,
  FigureNode,
  IframeNode,
  VideoNode,
  AudioNode,
  EmbedNode,
  EmbedTagNode,
  ObjectNode,
  BookmarkNode,
  ParagraphNode,
  QuoteNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  TableCellNode,
  TableRowNode,
  TableNode,
  CodeBlockNode,
  RootNode,
  MediaNode,
} from './nodes';

type ParsedHtmlNode = ContentNode | null;

const TAG_TO_TEXT_FORMAT: ReadonlyMap<string, TextFormat> = new Map([
  ['strong', 'bold'],
  ['b', 'bold'],
  ['em', 'italic'],
  ['i', 'italic'],
  ['s', 'strikethrough'],
  ['strike', 'strikethrough'],
  ['del', 'strikethrough'],
  ['u', 'underline'],
]);

const INLINE_TEXT_FORMAT_TAGS: ReadonlySet<string> = new Set(TAG_TO_TEXT_FORMAT.keys());

const GRID_ROW_REGEX = /grid-row:\s*([^;]+)/;
const GRID_COLUMN_REGEX = /grid-column:\s*([^;]+)/;
const GRID_TEMPLATE_ROWS_REGEX = /grid-template-rows:\s*([^;]+)/;
const GRID_TEMPLATE_COLS_REGEX = /grid-template-columns:\s*([^;]+)/;

const isNotNull = <T>(value: T | null): value is T => value !== null;
// Use numeric constants for Node type checks to work in both browser and Node.js environments
// Node.ELEMENT_NODE = 1, Node.TEXT_NODE = 3, Node.COMMENT_NODE = 8
const isDomElement = (node: { nodeType: number }): node is Element => node.nodeType === 1;
const isDomTextNode = (node: { nodeType: number }): node is Text => node.nodeType === 3;
const isDomCommentNode = (node: { nodeType: number }): node is Comment => node.nodeType === 8;
const isListTag = (tag: string): tag is 'ul' | 'ol' => tag === 'ul' || tag === 'ol';
const isHeadingTag = (tag: string): tag is HeadingTag =>
  tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6';

const getAttributesFromElement = <T extends readonly string[]>(
  element: Element,
  names: T,
): { [K in keyof T]: string | undefined } => {
  return names.map((name) => element.getAttribute(name) || undefined) as {
    [K in keyof T]: string | undefined;
  };
};

const getBooleanAttributesFromElement = <T extends readonly string[]>(
  element: Element,
  names: T,
): { [K in keyof T]: boolean | undefined } => {
  return names.map((name) => element.hasAttribute(name) || undefined) as {
    [K in keyof T]: boolean | undefined;
  };
};

const getTextFormats = (element: Element): TextFormat[] => {
  const textFormats: TextFormat[] = [];

  let current: Element | null = element;
  while (current && current.nodeType === 1) {
    const tagName = current.tagName.toLowerCase();
    const textFormat = TAG_TO_TEXT_FORMAT.get(tagName);
    if (textFormat) {
      textFormats.push(textFormat);
    }
    current = current.parentElement;
  }

  return textFormats;
};

const parseInlineContent = (node: Node, parentElement?: Element): ContentNode[] => {
  if (isDomTextNode(node)) {
    const text = node.textContent || '';
    if (!text) return [];
    const textFormats = parentElement ? getTextFormats(parentElement) : [];
    return [TextNode.from(text, textFormats)];
  }

  if (isDomElement(node)) {
    const tagName = node.tagName.toLowerCase();

    if (tagName === 'br') {
      return [LinebreakNode.from()];
    }

    if (tagName === 'a') {
      const url = node.getAttribute('href') || '';
      const children = Array.from(node.childNodes).flatMap((child) =>
        parseInlineContent(child, node),
      );
      return [LinkNode.from(url, children)];
    }

    if (INLINE_TEXT_FORMAT_TAGS.has(tagName)) {
      return Array.from(node.childNodes).flatMap((child) => parseInlineContent(child, node));
    }

    if (tagName === 'img') {
      const [src, alt, className, widthStr, heightStr] = getAttributesFromElement(node, [
        'src',
        'alt',
        'class',
        'width',
        'height',
      ] as const);
      const width = widthStr ? parseInt(widthStr, 10) : undefined;
      const height = heightStr ? parseInt(heightStr, 10) : undefined;
      return [ImageNode.from({ src: src || '', alt, className, width, height })];
    }

    return Array.from(node.childNodes).flatMap((child) => parseInlineContent(child, parentElement));
  }

  return [];
};

const parseMediaItem = (element: Element): MediaItem | null => {
  const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
  if (!img) return null;

  const style = element.getAttribute('style');
  const gridRow = style?.match(GRID_ROW_REGEX)?.[1].trim();
  const gridColumn = style?.match(GRID_COLUMN_REGEX)?.[1].trim();
  const caption = element.querySelector('figcaption')?.textContent?.trim() || undefined;

  return {
    key: element.getAttribute('data-media-key') || undefined,
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || undefined,
    caption,
    className: img.getAttribute('class') || undefined,
    width: img.getAttribute('width') ? parseInt(img.getAttribute('width')!, 10) : undefined,
    height: img.getAttribute('height') ? parseInt(img.getAttribute('height')!, 10) : undefined,
    gridRow,
    gridColumn,
  };
};

const parseBeCraftMedia = (element: Element): MediaNode => {
  const style = element.getAttribute('style');
  const rowsMatch = style?.match(GRID_TEMPLATE_ROWS_REGEX);
  const colsMatch = style?.match(GRID_TEMPLATE_COLS_REGEX);
  const gridStyle =
    rowsMatch && colsMatch ? { rows: rowsMatch[1].trim(), cols: colsMatch[1].trim() } : undefined;

  // data-media-key を持つ子要素から MediaItem を抽出
  const mediaKeyChildren = element.querySelectorAll('[data-media-key]');
  if (mediaKeyChildren.length > 0) {
    const items = Array.from(mediaKeyChildren)
      .map(parseMediaItem)
      .filter((item): item is MediaItem => item !== null);
    return MediaNode.from(items, gridStyle);
  }

  // data-media-key がない場合は直接の img 要素を探す
  const directImg = element.querySelector(':scope > img');
  if (directImg) {
    const item = parseMediaItem(element);
    return MediaNode.from(item ? [item] : [], gridStyle);
  }

  // figure 内の img を探す
  const figure = element.querySelector('figure');
  if (figure) {
    const item = parseMediaItem(figure);
    return MediaNode.from(item ? [item] : [], gridStyle);
  }

  return MediaNode.from([], gridStyle);
};

const hasClass = (element: Element, className: string): boolean =>
  (element.getAttribute('class') || '').split(/\s+/).includes(className);

// BeCraft の埋め込みリンク (bookmark) は BE の bookmark_to_html が
// `<a class="bookmark-card" ...>` で出力する。OGP メタ (title / description /
// thumbnail / favicon) が 1 つも無い場合は BE 側でクラス無しのプレーン
// アンカーにフォールバックするため、それは通常の LinkNode として扱えばよい。
const parseBookmarkCard = (element: Element): BookmarkNode => {
  const url = element.getAttribute('href') || '';
  const title = element.querySelector('.bookmark-card__title')?.textContent?.trim() || undefined;
  const description =
    element.querySelector('.bookmark-card__description')?.textContent?.trim() || undefined;
  const thumbnailUrl =
    element.querySelector('.bookmark-card__thumbnail img')?.getAttribute('src') || undefined;
  const faviconUrl =
    element.querySelector('.bookmark-card__favicon')?.getAttribute('src') || undefined;

  return BookmarkNode.from({ url, title, description, thumbnailUrl, faviconUrl });
};

const parseElement = (element: Element): ParsedHtmlNode => {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'p': {
      const children = Array.from(element.childNodes).flatMap((child) => parseInlineContent(child));
      return ParagraphNode.from(children);
    }

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const children = Array.from(element.childNodes).flatMap((child) => parseInlineContent(child));
      if (isHeadingTag(tagName)) {
        return HeadingNode.from(tagName, children);
      }
      return null;
    }

    case 'ul':
    case 'ol': {
      if (!isListTag(tagName)) return null;
      const children = Array.from(element.children)
        .filter((child): child is Element => child.tagName?.toLowerCase() === 'li')
        .map(parseElement)
        .filter(isNotNull);
      return ListNode.from(tagName, children);
    }

    case 'li': {
      const children = Array.from(element.childNodes).flatMap((child) => {
        if (!isDomElement(child)) {
          return parseInlineContent(child);
        }

        const childTagName = child.tagName.toLowerCase();
        if (childTagName === 'ul' || childTagName === 'ol') {
          const parsed = parseElement(child);
          return parsed ? [parsed] : [];
        }

        return parseInlineContent(child);
      });
      return ListItemNode.from(children);
    }

    case 'table': {
      const tbody = element.querySelector('tbody') || element;
      const rows = Array.from(tbody.querySelectorAll(':scope > tr'))
        .map(parseElement)
        .filter((node): node is TableRowNode => node?.type === 'tablerow');
      return TableNode.from(rows);
    }

    case 'tr': {
      const cells = Array.from(element.querySelectorAll(':scope > td, :scope > th'))
        .map(parseElement)
        .filter((node): node is TableCellNode => node?.type === 'tablecell');
      return TableRowNode.from(cells);
    }

    case 'td':
    case 'th': {
      const children = Array.from(element.childNodes).flatMap((child) => parseInlineContent(child));
      const headerState: 0 | 1 = tagName === 'th' ? 1 : 0;
      const colSpan = parseInt(element.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(element.getAttribute('rowspan') || '1', 10);
      return TableCellNode.from({ headerState, colSpan, rowSpan, children });
    }

    case 'blockquote': {
      const children = Array.from(element.childNodes).flatMap((child) => {
        if (isDomElement(child)) {
          const parsed = parseElement(child);
          return parsed ? [parsed] : [];
        }
        return parseInlineContent(child);
      });
      return QuoteNode.from(children);
    }

    case 'pre': {
      const codeElement = element.querySelector('code');
      const code = codeElement ? codeElement.textContent || '' : element.textContent || '';
      const language = codeElement?.className?.match(/language-(\w+)/)?.[1];
      return CodeBlockNode.from(code, language);
    }

    case 'img': {
      const [src, alt, className, widthStr, heightStr] = getAttributesFromElement(element, [
        'src',
        'alt',
        'class',
        'width',
        'height',
      ] as const);
      const width = widthStr ? parseInt(widthStr, 10) : undefined;
      const height = heightStr ? parseInt(heightStr, 10) : undefined;
      return ImageNode.from({ src: src || '', alt, className, width, height });
    }

    case 'a': {
      if (hasClass(element, 'bookmark-card')) {
        return parseBookmarkCard(element);
      }
      const url = element.getAttribute('href') || '';
      const children = Array.from(element.childNodes).flatMap((child) =>
        parseInlineContent(child, element),
      );
      return LinkNode.from(url, children);
    }

    case 'iframe': {
      const [src, width, height, title, allow] = getAttributesFromElement(element, [
        'src',
        'width',
        'height',
        'title',
        'allow',
      ] as const);
      const [allowFullscreen] = getBooleanAttributesFromElement(element, [
        'allowfullscreen',
      ] as const);
      return IframeNode.from({ src: src || '', width, height, title, allow, allowFullscreen });
    }

    case 'video': {
      const [src, width, height, poster] = getAttributesFromElement(element, [
        'src',
        'width',
        'height',
        'poster',
      ] as const);
      const [controls, autoplay, loop, muted] = getBooleanAttributesFromElement(element, [
        'controls',
        'autoplay',
        'loop',
        'muted',
      ] as const);
      return VideoNode.from({ src, width, height, controls, autoplay, loop, muted, poster });
    }

    case 'audio': {
      const [src] = getAttributesFromElement(element, ['src'] as const);
      const [controls, autoplay, loop, muted] = getBooleanAttributesFromElement(element, [
        'controls',
        'autoplay',
        'loop',
        'muted',
      ] as const);
      return AudioNode.from({ src, controls, autoplay, loop, muted });
    }

    case 'embed': {
      const [src, type, width, height] = getAttributesFromElement(element, [
        'src',
        'type',
        'width',
        'height',
      ] as const);
      return EmbedNode.from({ src: src || '', type, width, height });
    }

    case 'object': {
      const [data, type, name, width, height] = getAttributesFromElement(element, [
        'data',
        'type',
        'name',
        'width',
        'height',
      ] as const);
      return ObjectNode.from({ data, type, name, width, height });
    }

    case 'figure': {
      const imgElement = element.querySelector('img');
      if (!imgElement) return null;

      const [src, alt, className, widthStr, heightStr] = getAttributesFromElement(imgElement, [
        'src',
        'alt',
        'class',
        'width',
        'height',
      ] as const);
      const width = widthStr ? parseInt(widthStr, 10) : undefined;
      const height = heightStr ? parseInt(heightStr, 10) : undefined;
      const image = ImageNode.from({ src: src || '', alt, className, width, height });

      const figcaptionElement = element.querySelector('figcaption');
      const caption = figcaptionElement?.textContent?.trim() || undefined;

      return FigureNode.from(image, caption);
    }

    case 'div': {
      // data-becraft-media 属性をチェック
      if (element.hasAttribute('data-becraft-media')) {
        return parseBeCraftMedia(element);
      }

      const children = Array.from(element.childNodes).flatMap((child) => {
        if (isDomElement(child)) {
          const parsed = parseElement(child);
          return parsed ? [parsed] : [];
        }
        return parseInlineContent(child);
      });

      if (children.length === 1) return children[0];
      if (children.length > 0) return RootNode.from(children);
      return null;
    }

    case 'span':
    case 'figcaption': {
      const children = Array.from(element.childNodes).flatMap((child) => {
        if (isDomElement(child)) {
          const parsed = parseElement(child);
          return parsed ? [parsed] : [];
        }
        return parseInlineContent(child);
      });

      if (children.length === 1) return children[0];
      if (children.length > 0) return RootNode.from(children);
      return null;
    }

    default:
      // Unsupported HTML tags (not parsed by html-parser):
      // - <script> : Security risk, not supported intentionally
      // - <style>  : Security risk, not supported intentionally
      // - <hr>     : Horizontal rule
      // - <code>   : Inline code (outside of <pre>)
      // - <dl>, <dt>, <dd> : Definition list
      // - <sub>, <sup> : Subscript/Superscript
      // - <mark>   : Highlighted text
      // - <abbr>   : Abbreviation
      // - <details>, <summary> : Collapsible content
      // - <canvas>, <svg> : Graphics elements
      // - <form>, <input>, <button>, <select>, <textarea> : Form elements
      return null;
  }
};

type ParseableElement = {
  childNodes: NodeListOf<ChildNode>;
};

// 配信 API の html は全セクションを連結した 1 本の文字列になるため、埋め込みタグの
// 区間は BeCraft の renderer が HTML コメントの対で囲って送ってくる。ここで比較するのは
// コメントの中身なので、`<!--` `-->` を除いた本体だけを定数に持つ。
// 対応: apps/serverside/interface/src/renderer/embed_tag.rs
const EMBED_TAG_START_MARKER = '#embedtag';
const EMBED_TAG_END_MARKER = '/#embedtag';

const getCommentMarker = (node: ChildNode): string | null =>
  isDomCommentNode(node) ? (node.data || '').trim() : null;

// 区間内のノードを原文の HTML に戻す。埋め込みタグはタグ / 属性を一切落とさない
// 仕様のため、パース結果ではなく元の文字列表現を復元する。
const serializeNode = (node: ChildNode): string => {
  if (isDomElement(node)) return node.outerHTML;
  if (isDomCommentNode(node)) return `<!--${node.data}-->`;
  return node.textContent || '';
};

/**
 * Parse body element's child nodes into ContentNode array.
 * This is the core parsing function used by both client and server parsers.
 *
 * @param body - The body element containing HTML content
 * @returns Array of ContentNode
 * @internal
 */
export const parseBodyContent = (body: ParseableElement): ContentNode[] => {
  const children = Array.from(body.childNodes);
  const nodes: ContentNode[] = [];

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    if (getCommentMarker(child) === EMBED_TAG_START_MARKER) {
      const endIndex = children.findIndex(
        (node, i) => i > index && getCommentMarker(node) === EMBED_TAG_END_MARKER,
      );

      // 終了マーカーが無いと区間の終端が決まらない。以降の本文まで埋め込みタグに
      // 飲まれるのを避けるため、開始マーカーだけの場合は区間として扱わない。
      if (endIndex !== -1) {
        const html = children
          .slice(index + 1, endIndex)
          .map(serializeNode)
          .join('');
        nodes.push(EmbedTagNode.from({ html }));
        index = endIndex;
        continue;
      }
    }

    if (isDomElement(child)) {
      const parsed = parseElement(child);
      if (parsed) nodes.push(parsed);
      continue;
    }

    if (isDomTextNode(child)) {
      const text = child.textContent?.trim();
      if (text) nodes.push(TextNode.from(text, []));
    }
  }

  return nodes;
};

/**
 * Parse HTML string into ContentNode array on the client side using DOMParser.
 * This function is designed for browser usage.
 *
 * For server-side usage, use `parseHtmlOnServer` from 'becraft-sdk/server' instead.
 *
 * @param html - HTML string to parse
 * @returns Array of ContentNode
 */
export const parseHtml = (html: string): ContentNode[] => {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    console.warn('DOMParser is not available. HTML parsing requires a browser environment.');
    return [];
  }

  const parser = new DOMParser();
  // body を明示せずに渡すと、先頭の HTML コメントが html / head 側に移されて
  // body から消える。埋め込みタグの区間マーカーはコメントなので、
  // サーバー側パーサーと同じく body で囲ってから解析する。
  const doc = parser.parseFromString(
    `<!DOCTYPE html><html><body>${html}</body></html>`,
    'text/html',
  );

  return parseBodyContent(doc.body);
};
