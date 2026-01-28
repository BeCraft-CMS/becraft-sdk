import React from 'react';
import {
  type ContentNode,
  type TextNode,
  type LinkNode,
  type LinebreakNode,
  type ImageNode,
  type FigureNode,
  type IframeNode,
  type VideoNode,
  type AudioNode,
  type EmbedNode,
  type ObjectNode,
  type ParagraphNode,
  type QuoteNode,
  type HeadingNode,
  type ListNode,
  type ListItemNode,
  type TableNode,
  type TableRowNode,
  type TableCellNode,
  type CodeBlockNode,
  type RootNode,
  MediaNode,
} from '../parser/nodes';

type RenderFn = (node: ContentNode, config?: HTMLRendererConfig) => React.ReactNode;

const IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
const CONTROL_CHARS = /[\x00-\x1f\x7f]/g;

const sanitizeUrl = (url: string): string => {
  const cleaned = url.replace(CONTROL_CHARS, '');
  const trimmed = cleaned.trim();

  if (!trimmed || IS_SCRIPT_OR_DATA.test(trimmed)) {
    return '#';
  }

  return url;
};

interface NodeRendererProps<T extends ContentNode = ContentNode> {
  node: T;
  render: RenderFn;
  config?: HTMLRendererConfig;
}

export interface HTMLRendererConfig {
  textNodeRenderer?: React.FC<NodeRendererProps<TextNode>>;
  linkNodeRenderer?: React.FC<NodeRendererProps<LinkNode>>;
  linebreakNodeRenderer?: React.FC<NodeRendererProps<LinebreakNode>>;
  imageNodeRenderer?: React.FC<NodeRendererProps<ImageNode>>;
  figureNodeRenderer?: React.FC<NodeRendererProps<FigureNode>>;
  iframeNodeRenderer?: React.FC<NodeRendererProps<IframeNode>>;
  videoNodeRenderer?: React.FC<NodeRendererProps<VideoNode>>;
  audioNodeRenderer?: React.FC<NodeRendererProps<AudioNode>>;
  embedNodeRenderer?: React.FC<NodeRendererProps<EmbedNode>>;
  objectNodeRenderer?: React.FC<NodeRendererProps<ObjectNode>>;
  paragraphNodeRenderer?: React.FC<NodeRendererProps<ParagraphNode>>;
  quoteNodeRenderer?: React.FC<NodeRendererProps<QuoteNode>>;
  headingNodeRenderer?: React.FC<NodeRendererProps<HeadingNode>>;
  listNodeRenderer?: React.FC<NodeRendererProps<ListNode>>;
  listitemNodeRenderer?: React.FC<NodeRendererProps<ListItemNode>>;
  tableNodeRenderer?: React.FC<NodeRendererProps<TableNode>>;
  tableRowNodeRenderer?: React.FC<NodeRendererProps<TableRowNode>>;
  tableCellNodeRenderer?: React.FC<NodeRendererProps<TableCellNode>>;
  codeBlockNodeRenderer?: React.FC<NodeRendererProps<CodeBlockNode>>;
  mediaNodeRenderer?: React.FC<NodeRendererProps<MediaNode>>;
}

// Default renderers
const TextNodeRenderer: React.FC<NodeRendererProps<TextNode>> = ({ node, config }) => {
  if (config?.textNodeRenderer) {
    return config.textNodeRenderer({ node, render: renderNode, config });
  }

  let content: React.ReactNode = node.text;

  if (node.textFormats.includes('code')) {
    content = <code>{content}</code>;
  }
  if (node.textFormats.includes('italic')) {
    content = <em>{content}</em>;
  }
  if (node.textFormats.includes('bold')) {
    content = <strong>{content}</strong>;
  }
  if (node.textFormats.includes('strikethrough')) {
    content = <s>{content}</s>;
  }
  if (node.textFormats.includes('underline')) {
    content = <u>{content}</u>;
  }

  return <>{content}</>;
};

const LinkNodeRenderer: React.FC<NodeRendererProps<LinkNode>> = ({ node, render, config }) => {
  if (config?.linkNodeRenderer) {
    return config.linkNodeRenderer({ node, render, config });
  }

  return (
    <a href={sanitizeUrl(node.url)}>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </a>
  );
};

const LinebreakNodeRenderer: React.FC<NodeRendererProps<LinebreakNode>> = ({ node, config }) => {
  if (config?.linebreakNodeRenderer) {
    return config.linebreakNodeRenderer({ node, render: renderNode, config });
  }

  return <br />;
};

const ImageNodeRenderer: React.FC<NodeRendererProps<ImageNode>> = ({ node, config }) => {
  if (config?.imageNodeRenderer) {
    return config.imageNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <img
      src={node.src}
      alt={node.alt}
      className={node.className}
      width={node.width}
      height={node.height}
    />
  );
};

const FigureNodeRenderer: React.FC<NodeRendererProps<FigureNode>> = ({ node, config }) => {
  if (config?.figureNodeRenderer) {
    return config.figureNodeRenderer({ node, render: renderNode, config });
  }

  const { image, caption } = node;
  return (
    <figure>
      <img
        src={image.src}
        alt={image.alt}
        className={image.className}
        width={image.width}
        height={image.height}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

const IframeNodeRenderer: React.FC<NodeRendererProps<IframeNode>> = ({ node, config }) => {
  if (config?.iframeNodeRenderer) {
    return config.iframeNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <iframe
      src={sanitizeUrl(node.src)}
      width={node.width}
      height={node.height}
      title={node.title}
      allow={node.allow}
      allowFullScreen={node.allowFullscreen}
    />
  );
};

const VideoNodeRenderer: React.FC<NodeRendererProps<VideoNode>> = ({ node, config }) => {
  if (config?.videoNodeRenderer) {
    return config.videoNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <video
      src={node.src ? sanitizeUrl(node.src) : undefined}
      width={node.width}
      height={node.height}
      controls={node.controls}
      autoPlay={node.autoplay}
      loop={node.loop}
      muted={node.muted}
      poster={node.poster}
    />
  );
};

const AudioNodeRenderer: React.FC<NodeRendererProps<AudioNode>> = ({ node, config }) => {
  if (config?.audioNodeRenderer) {
    return config.audioNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <audio
      src={node.src ? sanitizeUrl(node.src) : undefined}
      controls={node.controls}
      autoPlay={node.autoplay}
      loop={node.loop}
      muted={node.muted}
    />
  );
};

const EmbedNodeRenderer: React.FC<NodeRendererProps<EmbedNode>> = ({ node, config }) => {
  if (config?.embedNodeRenderer) {
    return config.embedNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <embed
      src={sanitizeUrl(node.src)}
      type={node.embedType}
      width={node.width}
      height={node.height}
    />
  );
};

const ObjectNodeRenderer: React.FC<NodeRendererProps<ObjectNode>> = ({ node, config }) => {
  if (config?.objectNodeRenderer) {
    return config.objectNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <object
      data={node.data ? sanitizeUrl(node.data) : undefined}
      type={node.objectType}
      name={node.name}
      width={node.width}
      height={node.height}
    />
  );
};

const ParagraphNodeRenderer: React.FC<NodeRendererProps<ParagraphNode>> = ({
  node,
  render,
  config,
}) => {
  if (config?.paragraphNodeRenderer) {
    return config.paragraphNodeRenderer({ node, render, config });
  }

  return (
    <p>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </p>
  );
};

const QuoteNodeRenderer: React.FC<NodeRendererProps<QuoteNode>> = ({ node, render, config }) => {
  if (config?.quoteNodeRenderer) {
    return config.quoteNodeRenderer({ node, render, config });
  }

  return (
    <blockquote>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </blockquote>
  );
};

const HeadingNodeRenderer: React.FC<NodeRendererProps<HeadingNode>> = ({
  node,
  render,
  config,
}) => {
  if (config?.headingNodeRenderer) {
    return config.headingNodeRenderer({ node, render, config });
  }

  const Tag = node.tag;
  return (
    <Tag>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </Tag>
  );
};

const ListNodeRenderer: React.FC<NodeRendererProps<ListNode>> = ({ node, render, config }) => {
  if (config?.listNodeRenderer) {
    return config.listNodeRenderer({ node, render, config });
  }

  const Tag = node.tag;
  return (
    <Tag>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </Tag>
  );
};

const ListItemNodeRenderer: React.FC<NodeRendererProps<ListItemNode>> = ({
  node,
  render,
  config,
}) => {
  if (config?.listitemNodeRenderer) {
    return config.listitemNodeRenderer({ node, render, config });
  }

  return (
    <li>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </li>
  );
};

const TableNodeRenderer: React.FC<NodeRendererProps<TableNode>> = ({ node, render, config }) => {
  if (config?.tableNodeRenderer) {
    return config.tableNodeRenderer({ node, render, config });
  }

  return (
    <table>
      <tbody>
        {node.children.map((child, i) => (
          <React.Fragment key={i}>{render(child, config)}</React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const TableRowNodeRenderer: React.FC<NodeRendererProps<TableRowNode>> = ({
  node,
  render,
  config,
}) => {
  if (config?.tableRowNodeRenderer) {
    return config.tableRowNodeRenderer({ node, render, config });
  }

  return (
    <tr>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </tr>
  );
};

const TableCellNodeRenderer: React.FC<NodeRendererProps<TableCellNode>> = ({
  node,
  render,
  config,
}) => {
  if (config?.tableCellNodeRenderer) {
    return config.tableCellNodeRenderer({ node, render, config });
  }

  const { headerState, colSpan, rowSpan } = node;
  const cellProps = {
    colSpan: colSpan > 1 ? colSpan : undefined,
    rowSpan: rowSpan > 1 ? rowSpan : undefined,
  };

  const children = node.children.map((child, i) => (
    <React.Fragment key={i}>{render(child, config)}</React.Fragment>
  ));

  if (headerState > 0) {
    return <th {...cellProps}>{children}</th>;
  }
  return <td {...cellProps}>{children}</td>;
};

const CodeBlockNodeRenderer: React.FC<NodeRendererProps<CodeBlockNode>> = ({ node, config }) => {
  if (config?.codeBlockNodeRenderer) {
    return config.codeBlockNodeRenderer({ node, render: renderNode, config });
  }

  return (
    <pre>
      <code className={node.language ? `language-${node.language}` : undefined}>{node.code}</code>
    </pre>
  );
};

const RootNodeRenderer: React.FC<NodeRendererProps<RootNode>> = ({ node, render, config }) => {
  return (
    <>
      {node.children.map((child, i) => (
        <React.Fragment key={i}>{render(child, config)}</React.Fragment>
      ))}
    </>
  );
};

const MediaNodeRenderer: React.FC<NodeRendererProps<MediaNode>> = ({ node, config }) => {
  if (config?.mediaNodeRenderer) {
    return config.mediaNodeRenderer({ node, render: renderNode, config });
  }

  if (node.items.length === 1 && !node.gridStyle) {
    const item = node.items[0];
    const imgElement = (
      <img
        src={item.src}
        alt={item.alt || ''}
        className={item.className}
        width={item.width}
        height={item.height}
      />
    );

    if (item.caption) {
      return (
        <figure>
          {imgElement}
          <figcaption>{item.caption}</figcaption>
        </figure>
      );
    }

    return imgElement;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: node.gridStyle?.rows,
        gridTemplateColumns: node.gridStyle?.cols,
      }}
    >
      {node.items.map((item, index) => (
        <div
          key={item.key || `media-${item.src}-${index}`}
          style={{
            gridRow: item.gridRow,
            gridColumn: item.gridColumn,
          }}
        >
          <img
            src={item.src}
            alt={item.alt || ''}
            className={item.className}
            width={item.width}
            height={item.height}
          />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </div>
      ))}
    </div>
  );
};

// Main render function
const renderNode: RenderFn = (node, config) => {
  switch (node.type) {
    // Block-editor nodes
    case 'text':
      return <TextNodeRenderer node={node} render={renderNode} config={config} />;
    case 'link':
      return <LinkNodeRenderer node={node} render={renderNode} config={config} />;
    case 'linebreak':
      return <LinebreakNodeRenderer node={node} render={renderNode} config={config} />;
    case 'image':
      return <ImageNodeRenderer node={node} render={renderNode} config={config} />;
    case 'figure':
      return <FigureNodeRenderer node={node} render={renderNode} config={config} />;
    case 'paragraph':
      return <ParagraphNodeRenderer node={node} render={renderNode} config={config} />;
    case 'quote':
      return <QuoteNodeRenderer node={node} render={renderNode} config={config} />;
    case 'heading':
      return <HeadingNodeRenderer node={node} render={renderNode} config={config} />;
    case 'list':
      return <ListNodeRenderer node={node} render={renderNode} config={config} />;
    case 'listitem':
      return <ListItemNodeRenderer node={node} render={renderNode} config={config} />;
    case 'table':
      return <TableNodeRenderer node={node} render={renderNode} config={config} />;
    case 'tablerow':
      return <TableRowNodeRenderer node={node} render={renderNode} config={config} />;
    case 'tablecell':
      return <TableCellNodeRenderer node={node} render={renderNode} config={config} />;
    case 'codeblock':
      return <CodeBlockNodeRenderer node={node} render={renderNode} config={config} />;
    case 'root':
      return <RootNodeRenderer node={node} render={renderNode} config={config} />;

    // Media node
    case 'media':
      return <MediaNodeRenderer node={node} render={renderNode} config={config} />;

    // Embedded-tag nodes
    case 'iframe':
      return <IframeNodeRenderer node={node} render={renderNode} config={config} />;
    case 'video':
      return <VideoNodeRenderer node={node} render={renderNode} config={config} />;
    case 'audio':
      return <AudioNodeRenderer node={node} render={renderNode} config={config} />;
    case 'embed':
      return <EmbedNodeRenderer node={node} render={renderNode} config={config} />;
    case 'object':
      return <ObjectNodeRenderer node={node} render={renderNode} config={config} />;

    default:
      return null;
  }
};

export const BeCraftHTMLRenderer: React.FC<{
  nodes: ContentNode[];
  config?: HTMLRendererConfig;
}> = ({ nodes, config }) => {
  return (
    <>
      {nodes.map((node, index) => (
        <React.Fragment key={index}>{renderNode(node, config)}</React.Fragment>
      ))}
    </>
  );
};
