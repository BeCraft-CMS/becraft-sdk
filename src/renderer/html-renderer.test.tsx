import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BeCraftHTMLRenderer } from './html-renderer';
import { parseHtml } from '../parser/html-parser';
import { MediaNode, BookmarkNode } from '../parser/nodes';

describe('BeCraftHTMLRenderer', () => {
  it('should render HTML paragraph', () => {
    const nodes = parseHtml('<p>Hello World</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('p')).toBeTruthy();
    expect(container.textContent).toBe('Hello World');
  });

  it('should render HTML with bold text', () => {
    const nodes = parseHtml('<p><strong>Bold</strong> text</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.querySelector('strong')?.textContent).toBe('Bold');
  });

  it('should render HTML with italic text', () => {
    const nodes = parseHtml('<p><em>Italic</em> text</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('em')).toBeTruthy();
    expect(container.querySelector('em')?.textContent).toBe('Italic');
  });

  it('should render HTML heading', () => {
    const nodes = parseHtml('<h1>Title</h1>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('h1')?.textContent).toBe('Title');
  });

  it('should render HTML link', () => {
    const nodes = parseHtml('<p><a href="https://example.com">Link</a></p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.textContent).toBe('Link');
  });

  it('should render HTML list', () => {
    const nodes = parseHtml('<ul><li>Item 1</li><li>Item 2</li></ul>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('ul')).toBeTruthy();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('should render HTML table', () => {
    const nodes = parseHtml(
      '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>',
    );
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelectorAll('td')).toHaveLength(2);
  });

  it('should render HTML image', () => {
    const nodes = parseHtml('<img src="https://example.com/image.png" alt="Alt text">');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('Alt text');
  });

  it('should render HTML image with width and height', () => {
    const nodes = parseHtml(
      '<img src="https://example.com/image.png" alt="Alt text" width="800" height="600">',
    );
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('width')).toBe('800');
    expect(img?.getAttribute('height')).toBe('600');
  });

  it('should render HTML image with width only', () => {
    const nodes = parseHtml('<img src="https://example.com/image.png" alt="Alt text" width="800">');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    const img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('800');
    expect(img?.getAttribute('height')).toBeNull();
  });

  it('should render figure with image width and height', () => {
    const nodes = parseHtml(
      '<figure><img src="https://example.com/image.png" alt="Alt text" width="1024" height="768"><figcaption>Caption</figcaption></figure>',
    );
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    const img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('1024');
    expect(img?.getAttribute('height')).toBe('768');
    expect(container.querySelector('figcaption')?.textContent).toBe('Caption');
  });

  it('should render complex HTML content', () => {
    const nodes = parseHtml(`
      <h1>Article Title</h1>
      <p>This is a <strong>bold</strong> paragraph with a <a href="https://example.com">link</a>.</p>
      <ul>
        <li>First item</li>
        <li>Second item</li>
      </ul>
    `);
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('p')).toBeTruthy();
    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.querySelector('a')).toBeTruthy();
    expect(container.querySelector('ul')).toBeTruthy();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('should render code block', () => {
    const nodes = parseHtml('<pre><code>const x = 1;</code></pre>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('code')).toBeTruthy();
    expect(container.textContent).toContain('const x = 1;');
  });

  it('should render HTML with line break', () => {
    const nodes = parseHtml('<p>Hello<br>World</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('br')).toBeTruthy();
    expect(container.textContent).toBe('HelloWorld');
  });

  it('should render multiple line breaks', () => {
    const nodes = parseHtml('<p>Line 1<br>Line 2<br>Line 3</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelectorAll('br')).toHaveLength(2);
    expect(container.textContent).toBe('Line 1Line 2Line 3');
  });

  it('should render HTML with strikethrough text', () => {
    const nodes = parseHtml('<p><s>Strikethrough</s> text</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('s')).toBeTruthy();
    expect(container.querySelector('s')?.textContent).toBe('Strikethrough');
  });

  it('should render HTML with underline text', () => {
    const nodes = parseHtml('<p><u>Underline</u> text</p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('u')).toBeTruthy();
    expect(container.querySelector('u')?.textContent).toBe('Underline');
  });

  it('should render HTML with all text styles', () => {
    const nodes = parseHtml('<p><u><s><strong><em>All styles</em></strong></s></u></p>');
    const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

    expect(container.querySelector('u')).toBeTruthy();
    expect(container.querySelector('s')).toBeTruthy();
    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.querySelector('em')).toBeTruthy();
    expect(container.textContent).toContain('All styles');
  });

  describe('URL sanitization', () => {
    it('should sanitize javascript: URLs', () => {
      const nodes = parseHtml('<p><a href="javascript:alert(1)">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize data: URLs', () => {
      const nodes = parseHtml(
        '<p><a href="data:text/html,<script>alert(1)</script>">Click me</a></p>',
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize vbscript: URLs', () => {
      const nodes = parseHtml('<p><a href="vbscript:msgbox(1)">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize livescript: URLs', () => {
      const nodes = parseHtml('<p><a href="livescript:alert(1)">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize URLs with leading whitespace', () => {
      const nodes = parseHtml('<p><a href="   javascript:alert(1)">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize URLs with mixed case', () => {
      const nodes = parseHtml('<p><a href="JaVaScRiPt:alert(1)">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize empty URLs', () => {
      const nodes = parseHtml('<p><a href="">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should sanitize whitespace-only URLs', () => {
      const nodes = parseHtml('<p><a href="   ">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('#');
    });

    it('should allow safe http URLs', () => {
      const nodes = parseHtml('<p><a href="http://example.com">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('http://example.com');
    });

    it('should allow safe https URLs', () => {
      const nodes = parseHtml('<p><a href="https://example.com">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://example.com');
    });

    it('should allow relative URLs', () => {
      const nodes = parseHtml('<p><a href="/path/to/page">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/path/to/page');
    });

    it('should allow mailto URLs', () => {
      const nodes = parseHtml('<p><a href="mailto:test@example.com">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('mailto:test@example.com');
    });

    it('should allow tel URLs', () => {
      const nodes = parseHtml('<p><a href="tel:+1234567890">Click me</a></p>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('tel:+1234567890');
    });
  });

  describe('embed element', () => {
    it('should render embed element with all attributes', () => {
      const nodes = parseHtml(
        '<embed src="https://example.com/video.swf" type="application/x-shockwave-flash" width="640" height="480">',
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const embed = container.querySelector('embed');
      expect(embed).toBeTruthy();
      expect(embed?.getAttribute('src')).toBe('https://example.com/video.swf');
      expect(embed?.getAttribute('type')).toBe('application/x-shockwave-flash');
      expect(embed?.getAttribute('width')).toBe('640');
      expect(embed?.getAttribute('height')).toBe('480');
    });

    it('should sanitize javascript: URLs in embed', () => {
      const nodes = parseHtml('<embed src="javascript:alert(1)">');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const embed = container.querySelector('embed');
      expect(embed).toBeTruthy();
      expect(embed?.getAttribute('src')).toBe('#');
    });
  });

  describe('object element', () => {
    it('should render object element with all attributes', () => {
      const nodes = parseHtml(
        '<object data="https://example.com/movie.swf" type="application/x-shockwave-flash" name="movie" width="640" height="480"></object>',
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const object = container.querySelector('object');
      expect(object).toBeTruthy();
      expect(object?.getAttribute('data')).toBe('https://example.com/movie.swf');
      expect(object?.getAttribute('type')).toBe('application/x-shockwave-flash');
      expect(object?.getAttribute('name')).toBe('movie');
      expect(object?.getAttribute('width')).toBe('640');
      expect(object?.getAttribute('height')).toBe('480');
    });

    it('should sanitize javascript: URLs in object data', () => {
      const nodes = parseHtml('<object data="javascript:alert(1)"></object>');
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const object = container.querySelector('object');
      expect(object).toBeTruthy();
      expect(object?.getAttribute('data')).toBe('#');
    });
  });

  describe('bookmark element', () => {
    const fullCardHtml =
      '<a class="bookmark-card" href="https://example.com/article" rel="noopener noreferrer" target="_blank">' +
      '<div class="bookmark-card__thumbnail"><img src="https://example.com/thumb.png" alt=""></div>' +
      '<div class="bookmark-card__body">' +
      '<p class="bookmark-card__title">Example Title</p>' +
      '<p class="bookmark-card__description">Example description</p>' +
      '<div class="bookmark-card__footer">' +
      '<img class="bookmark-card__favicon" src="https://example.com/favicon.ico" alt="">' +
      '<span class="bookmark-card__url">https://example.com/article</span>' +
      '</div></div></a>';

    it('should render a full bookmark card', () => {
      const nodes = parseHtml(fullCardHtml);
      const { container } = render(<BeCraftHTMLRenderer nodes={nodes} />);

      const card = container.querySelector('a.bookmark-card');
      expect(card).toBeTruthy();
      expect(card?.getAttribute('href')).toBe('https://example.com/article');
      expect(card?.getAttribute('target')).toBe('_blank');
      expect(card?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(card?.querySelector('.bookmark-card__title')?.textContent).toBe('Example Title');
      expect(card?.querySelector('.bookmark-card__description')?.textContent).toBe(
        'Example description',
      );
      expect(card?.querySelector('.bookmark-card__thumbnail img')?.getAttribute('src')).toBe(
        'https://example.com/thumb.png',
      );
      expect(card?.querySelector('.bookmark-card__favicon')?.getAttribute('src')).toBe(
        'https://example.com/favicon.ico',
      );
      expect(card?.querySelector('.bookmark-card__url')?.textContent).toBe(
        'https://example.com/article',
      );
    });

    it('should render a bookmark without optional fields as a plain anchor', () => {
      const node = BookmarkNode.from({ url: 'https://example.com' });
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);

      const anchor = container.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor?.classList.contains('bookmark-card')).toBe(false);
      expect(anchor?.getAttribute('href')).toBe('https://example.com');
      expect(anchor?.textContent).toBe('https://example.com');
    });

    it('should sanitize javascript: URLs in bookmark href', () => {
      const node = BookmarkNode.from({ url: 'javascript:alert(1)', title: 'Evil' });
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);

      const card = container.querySelector('a.bookmark-card');
      expect(card).toBeTruthy();
      expect(card?.getAttribute('href')).toBe('#');
    });

    it('should use a custom bookmarkNodeRenderer when provided', () => {
      const node = BookmarkNode.from({ url: 'https://example.com', title: 'Title' });
      const { container } = render(
        <BeCraftHTMLRenderer
          nodes={[node]}
          config={{
            bookmarkNodeRenderer: ({ node }) => <div data-testid="custom">{node.url}</div>,
          }}
        />,
      );

      expect(container.querySelector('[data-testid="custom"]')?.textContent).toBe(
        'https://example.com',
      );
    });
  });

  describe('MediaNode rendering', () => {
    it('should render MediaNode with single image', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg' }]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
      expect(img?.getAttribute('alt')).toBe('');
    });

    it('should render MediaNode with alt text', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', alt: 'Sample image' }]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('alt')).toBe('Sample image');
    });

    it('should render MediaNode with class attribute', () => {
      const node = MediaNode.from([
        { src: 'https://example.com/image.jpg', className: 'custom-image-class' },
      ]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('class')).toBe('custom-image-class');
    });

    it('should render MediaNode with caption in figure element', () => {
      const node = MediaNode.from([
        { src: 'https://example.com/image.jpg', caption: 'This is a caption' },
      ]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const figure = container.querySelector('figure');
      const img = container.querySelector('img');
      const figcaption = container.querySelector('figcaption');

      expect(figure).toBeTruthy();
      expect(img).toBeTruthy();
      expect(figcaption).toBeTruthy();
      expect(figcaption?.textContent).toBe('This is a caption');
    });

    it('should render MediaNode with width and height', () => {
      const node = MediaNode.from([
        { src: 'https://example.com/image.jpg', width: 800, height: 600 },
      ]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('800');
      expect(img?.getAttribute('height')).toBe('600');
    });

    it('should not render figure when caption is not provided', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg' }]);
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const figure = container.querySelector('figure');
      expect(figure).toBeFalsy();
    });

    it('should use custom mediaNodeRenderer when provided', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg' }]);
      const customRenderer = vi.fn(() => <div data-testid="custom-media">Custom Media</div>);
      const { container } = render(
        <BeCraftHTMLRenderer nodes={[node]} config={{ mediaNodeRenderer: customRenderer }} />,
      );
      expect(customRenderer).toHaveBeenCalled();
      expect(container.querySelector('[data-testid="custom-media"]')).toBeTruthy();
    });
  });

  describe('MediaNode grid layout rendering', () => {
    it('should render MediaNode with CSS Grid when gridStyle is provided', () => {
      const node = MediaNode.from(
        [
          { key: 'img1', src: 'https://example.com/1.jpg' },
          { key: 'img2', src: 'https://example.com/2.jpg' },
        ],
        { rows: 'repeat(2, 1fr)', cols: 'repeat(2, 1fr)' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.display).toBe('grid');
      expect(grid.style.gridTemplateRows).toBe('repeat(2, 1fr)');
      expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });

    it('should render multiple images in MediaNode grid', () => {
      const node = MediaNode.from(
        [
          { key: 'img1', src: 'https://example.com/1.jpg' },
          { key: 'img2', src: 'https://example.com/2.jpg' },
        ],
        { rows: '1fr', cols: 'repeat(2, 1fr)' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(2);
      expect(images[0].getAttribute('src')).toBe('https://example.com/1.jpg');
      expect(images[1].getAttribute('src')).toBe('https://example.com/2.jpg');
    });

    it('should apply grid position styles to items', () => {
      const node = MediaNode.from(
        [{ key: 'img1', src: 'https://example.com/1.jpg', gridRow: '1 / 3', gridColumn: '1 / 2' }],
        { rows: 'repeat(2, 1fr)', cols: 'repeat(2, 1fr)' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      // The grid container is the first div, the cell is its child div
      const gridContainer = container.firstChild as HTMLElement;
      const cell = gridContainer.firstChild as HTMLElement;
      // Check style attribute since jsdom may not fully support grid properties
      const styleAttr = cell.getAttribute('style') || '';
      expect(styleAttr).toContain('grid-row');
      expect(styleAttr).toContain('grid-column');
    });

    it('should render images with width and height in grid layout', () => {
      const node = MediaNode.from(
        [{ key: 'img1', src: 'https://example.com/1.jpg', width: 800, height: 600 }],
        { rows: '1fr', cols: '1fr' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('800');
      expect(img?.getAttribute('height')).toBe('600');
    });

    it('should render images with alt text in grid layout', () => {
      const node = MediaNode.from(
        [{ key: 'img1', src: 'https://example.com/1.jpg', alt: 'Test image' }],
        { rows: '1fr', cols: '1fr' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[node]} />);
      const img = container.querySelector('img');
      expect(img?.getAttribute('alt')).toBe('Test image');
    });
  });

  describe('mixed nodes rendering', () => {
    it('should render multiple MediaNode instances', () => {
      const singleNode = MediaNode.from([{ src: 'https://example.com/single.jpg' }]);
      const gridNode = MediaNode.from(
        [
          { key: 'img1', src: 'https://example.com/1.jpg' },
          { key: 'img2', src: 'https://example.com/2.jpg' },
        ],
        { rows: '1fr', cols: 'repeat(2, 1fr)' },
      );
      const { container } = render(<BeCraftHTMLRenderer nodes={[singleNode, gridNode]} />);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(3);
    });
  });
});
