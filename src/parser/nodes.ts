export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TextFormat = 'bold' | 'italic' | 'strikethrough' | 'underline' | 'code';

export type ImageNodeInput = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

export type IframeNodeInput = {
  src: string;
  width?: string;
  height?: string;
  title?: string;
  allow?: string;
  allowFullscreen?: boolean;
};

export type VideoNodeInput = {
  src?: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
};

export type AudioNodeInput = {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export type EmbedNodeInput = {
  src: string;
  type?: string;
  width?: string;
  height?: string;
};

export type ObjectNodeInput = {
  data?: string;
  type?: string;
  name?: string;
  width?: string;
  height?: string;
};

export type TableCellNodeInput = {
  headerState: 0 | 1 | 2 | 3;
  colSpan: number;
  rowSpan: number;
  children: ContentNode[];
};

export type ContentNode =
  | TextNode
  | LinkNode
  | LinebreakNode
  | ImageNode
  | FigureNode
  | IframeNode
  | VideoNode
  | AudioNode
  | EmbedNode
  | ObjectNode
  | ParagraphNode
  | QuoteNode
  | HeadingNode
  | ListNode
  | ListItemNode
  | TableCellNode
  | TableRowNode
  | TableNode
  | CodeBlockNode
  | RootNode
  | MediaNode;

export class TextNode {
  readonly type: 'text' = 'text';
  readonly text: string;
  readonly textFormats: TextFormat[];

  constructor(text: string, textFormats: TextFormat[]) {
    this.text = text;
    this.textFormats = textFormats;
  }

  static from(text: string, textFormats: TextFormat[]): TextNode {
    return new TextNode(text, textFormats);
  }
}

export class LinkNode {
  readonly type: 'link' = 'link';
  readonly url: string;
  readonly children: ContentNode[];

  constructor(url: string, children: ContentNode[]) {
    this.url = url;
    this.children = children;
  }

  static from(url: string, children: ContentNode[]): LinkNode {
    return new LinkNode(url, children);
  }
}

export class LinebreakNode {
  readonly type: 'linebreak' = 'linebreak';

  static from(): LinebreakNode {
    return new LinebreakNode();
  }
}

export class ImageNode {
  readonly type: 'image' = 'image';
  readonly src: string;
  readonly alt?: string;
  readonly className?: string;
  readonly width?: number;
  readonly height?: number;

  constructor(input: ImageNodeInput) {
    this.src = input.src;
    this.alt = input.alt;
    this.className = input.className;
    this.width = input.width;
    this.height = input.height;
  }

  static from(input: ImageNodeInput): ImageNode {
    return new ImageNode(input);
  }
}

export class FigureNode {
  readonly type: 'figure' = 'figure';
  readonly image: ImageNode;
  readonly caption?: string;

  constructor(image: ImageNode, caption?: string) {
    this.image = image;
    this.caption = caption;
  }

  static from(image: ImageNode, caption?: string): FigureNode {
    return new FigureNode(image, caption);
  }
}

export class IframeNode {
  readonly type: 'iframe' = 'iframe';
  readonly src: string;
  readonly width?: string;
  readonly height?: string;
  readonly title?: string;
  readonly allow?: string;
  readonly allowFullscreen?: boolean;

  constructor(input: IframeNodeInput) {
    this.src = input.src;
    this.width = input.width;
    this.height = input.height;
    this.title = input.title;
    this.allow = input.allow;
    this.allowFullscreen = input.allowFullscreen;
  }

  static from(input: IframeNodeInput): IframeNode {
    return new IframeNode(input);
  }
}

export class VideoNode {
  readonly type: 'video' = 'video';
  readonly src?: string;
  readonly width?: string;
  readonly height?: string;
  readonly controls?: boolean;
  readonly autoplay?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
  readonly poster?: string;

  constructor(input: VideoNodeInput) {
    this.src = input.src;
    this.width = input.width;
    this.height = input.height;
    this.controls = input.controls;
    this.autoplay = input.autoplay;
    this.loop = input.loop;
    this.muted = input.muted;
    this.poster = input.poster;
  }

  static from(input: VideoNodeInput): VideoNode {
    return new VideoNode(input);
  }
}

export class AudioNode {
  readonly type: 'audio' = 'audio';
  readonly src?: string;
  readonly controls?: boolean;
  readonly autoplay?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;

  constructor(input: AudioNodeInput) {
    this.src = input.src;
    this.controls = input.controls;
    this.autoplay = input.autoplay;
    this.loop = input.loop;
    this.muted = input.muted;
  }

  static from(input: AudioNodeInput): AudioNode {
    return new AudioNode(input);
  }
}

export class EmbedNode {
  readonly type: 'embed' = 'embed';
  readonly src: string;
  readonly embedType?: string;
  readonly width?: string;
  readonly height?: string;

  constructor(input: EmbedNodeInput) {
    this.src = input.src;
    this.embedType = input.type;
    this.width = input.width;
    this.height = input.height;
  }

  static from(input: EmbedNodeInput): EmbedNode {
    return new EmbedNode(input);
  }
}

export class ObjectNode {
  readonly type: 'object' = 'object';
  readonly data?: string;
  readonly objectType?: string;
  readonly name?: string;
  readonly width?: string;
  readonly height?: string;

  constructor(input: ObjectNodeInput) {
    this.data = input.data;
    this.objectType = input.type;
    this.name = input.name;
    this.width = input.width;
    this.height = input.height;
  }

  static from(input: ObjectNodeInput): ObjectNode {
    return new ObjectNode(input);
  }
}

export class ParagraphNode {
  readonly type: 'paragraph' = 'paragraph';
  readonly children: ContentNode[];

  constructor(children: ContentNode[]) {
    this.children = children;
  }

  static from(children: ContentNode[]): ParagraphNode {
    return new ParagraphNode(children);
  }
}

export class QuoteNode {
  readonly type: 'quote' = 'quote';
  readonly children: ContentNode[];

  constructor(children: ContentNode[]) {
    this.children = children;
  }

  static from(children: ContentNode[]): QuoteNode {
    return new QuoteNode(children);
  }
}

export class HeadingNode {
  readonly type: 'heading' = 'heading';
  readonly tag: HeadingTag;
  readonly children: ContentNode[];

  constructor(tag: HeadingTag, children: ContentNode[]) {
    this.tag = tag;
    this.children = children;
  }

  static from(tag: HeadingTag, children: ContentNode[]): HeadingNode {
    return new HeadingNode(tag, children);
  }
}

export class ListNode {
  readonly type: 'list' = 'list';
  readonly tag: 'ul' | 'ol';
  readonly children: ContentNode[];

  constructor(tag: 'ul' | 'ol', children: ContentNode[]) {
    this.tag = tag;
    this.children = children;
  }

  static from(tag: 'ul' | 'ol', children: ContentNode[]): ListNode {
    return new ListNode(tag, children);
  }
}

export class ListItemNode {
  readonly type: 'listitem' = 'listitem';
  readonly children: ContentNode[];

  constructor(children: ContentNode[]) {
    this.children = children;
  }

  static from(children: ContentNode[]): ListItemNode {
    return new ListItemNode(children);
  }
}

export class TableCellNode {
  readonly type: 'tablecell' = 'tablecell';
  readonly headerState: 0 | 1 | 2 | 3;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly children: ContentNode[];

  constructor(input: TableCellNodeInput) {
    this.headerState = input.headerState;
    this.colSpan = input.colSpan;
    this.rowSpan = input.rowSpan;
    this.children = input.children;
  }

  static from(input: TableCellNodeInput): TableCellNode {
    return new TableCellNode(input);
  }
}

export class TableRowNode {
  readonly type: 'tablerow' = 'tablerow';
  readonly children: TableCellNode[];

  constructor(children: TableCellNode[]) {
    this.children = children;
  }

  static from(children: TableCellNode[]): TableRowNode {
    return new TableRowNode(children);
  }
}

export class TableNode {
  readonly type: 'table' = 'table';
  readonly children: TableRowNode[];

  constructor(children: TableRowNode[]) {
    this.children = children;
  }

  static from(children: TableRowNode[]): TableNode {
    return new TableNode(children);
  }
}

export class CodeBlockNode {
  readonly type: 'codeblock' = 'codeblock';
  readonly code: string;
  readonly language?: string;

  constructor(code: string, language?: string) {
    this.code = code;
    this.language = language;
  }

  static from(code: string, language?: string): CodeBlockNode {
    return new CodeBlockNode(code, language);
  }
}

export class RootNode {
  readonly type: 'root' = 'root';
  readonly children: ContentNode[];

  constructor(children: ContentNode[]) {
    this.children = children;
  }

  static from(children: ContentNode[]): RootNode {
    return new RootNode(children);
  }
}

export interface MediaItem {
  key?: string;
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
  width?: number;
  height?: number;
  gridRow?: string;
  gridColumn?: string;
}

export class MediaNode {
  readonly type: 'media' = 'media';
  readonly items: MediaItem[];
  readonly gridStyle?: {
    rows: string;
    cols: string;
  };

  constructor(items: MediaItem[], gridStyle?: { rows: string; cols: string }) {
    this.items = items;
    this.gridStyle = gridStyle;
  }

  static from(items: MediaItem[], gridStyle?: { rows: string; cols: string }): MediaNode {
    return new MediaNode(items, gridStyle);
  }
}
