import { describe, expect, it } from 'vitest';
import { parseHtml } from './html-parser';
import { MediaNode } from './nodes';

describe('parseHtml', () => {
  describe('paragraph', () => {
    it('should parse a simple paragraph', () => {
      const html = '<p>Hello World</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Hello World');
        }
      }
    });

    it('should parse paragraph with bold text', () => {
      const html = '<p><strong>Bold</strong> text</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Bold');
          expect(result[0].children[0].textFormats).toEqual(['bold']);
        }
      }
    });

    it('should parse paragraph with italic text', () => {
      const html = '<p><em>Italic</em> text</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Italic');
          expect(result[0].children[0].textFormats).toEqual(['italic']);
        }
      }
    });

    it('should parse paragraph with bold and italic text', () => {
      const html = '<p><strong><em>Bold Italic</em></strong></p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Bold Italic');
          expect(result[0].children[0].textFormats).toContain('bold');
          expect(result[0].children[0].textFormats).toContain('italic');
        }
      }
    });

    it('should parse paragraph with strikethrough text', () => {
      const html = '<p><s>Strikethrough</s> text</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Strikethrough');
          expect(result[0].children[0].textFormats).toEqual(['strikethrough']);
        }
      }
    });

    it('should parse paragraph with underline text', () => {
      const html = '<p><u>Underline</u> text</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Underline');
          expect(result[0].children[0].textFormats).toEqual(['underline']);
        }
      }
    });

    it('should parse paragraph with all text styles', () => {
      const html = '<p><u><s><strong><em>All styles</em></strong></s></u></p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('All styles');
          expect(result[0].children[0].textFormats).toContain('bold');
          expect(result[0].children[0].textFormats).toContain('italic');
          expect(result[0].children[0].textFormats).toContain('strikethrough');
          expect(result[0].children[0].textFormats).toContain('underline');
        }
      }
    });
  });

  describe('heading', () => {
    it('should parse h1', () => {
      const html = '<h1>Heading 1</h1>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h1');
        expect(result[0].children).toHaveLength(1);
      }
    });

    it('should parse h2', () => {
      const html = '<h2>Heading 2</h2>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h2');
      }
    });

    it('should parse h3', () => {
      const html = '<h3>Heading 3</h3>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h3');
      }
    });

    it('should parse h4', () => {
      const html = '<h4>Heading 4</h4>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h4');
      }
    });

    it('should parse h5', () => {
      const html = '<h5>Heading 5</h5>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h5');
      }
    });

    it('should parse h6', () => {
      const html = '<h6>Heading 6</h6>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('heading');
      if (result[0].type === 'heading') {
        expect(result[0].tag).toBe('h6');
      }
    });
  });

  describe('link', () => {
    it('should parse a link', () => {
      const html = '<p><a href="https://example.com">Link text</a></p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].type).toBe('link');
        if (result[0].children[0].type === 'link') {
          expect(result[0].children[0].url).toBe('https://example.com');
          expect(result[0].children[0].children).toHaveLength(1);
        }
      }
    });
  });

  describe('linebreak', () => {
    it('should parse br tag in paragraph', () => {
      const html = '<p>Hello<br>World</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(3);
        expect(result[0].children[0].type).toBe('text');
        expect(result[0].children[1].type).toBe('linebreak');
        expect(result[0].children[2].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].text).toBe('Hello');
        }
        if (result[0].children[2].type === 'text') {
          expect(result[0].children[2].text).toBe('World');
        }
      }
    });

    it('should parse multiple br tags', () => {
      const html = '<p>Line 1<br>Line 2<br>Line 3</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(5);
        expect(result[0].children[1].type).toBe('linebreak');
        expect(result[0].children[3].type).toBe('linebreak');
      }
    });

    it('should parse br tag with formatting', () => {
      const html = '<p><strong>Bold</strong><br><em>Italic</em></p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(3);
        expect(result[0].children[0].type).toBe('text');
        expect(result[0].children[1].type).toBe('linebreak');
        expect(result[0].children[2].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].textFormats).toContain('bold');
        }
        if (result[0].children[2].type === 'text') {
          expect(result[0].children[2].textFormats).toContain('italic');
        }
      }
    });
  });

  describe('list', () => {
    it('should parse unordered list', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
      if (result[0].type === 'list') {
        expect(result[0].tag).toBe('ul');
        expect(result[0].children).toHaveLength(2);
      }
    });

    it('should parse ordered list', () => {
      const html = '<ol><li>Item 1</li><li>Item 2</li></ol>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
      if (result[0].type === 'list') {
        expect(result[0].tag).toBe('ol');
        expect(result[0].children).toHaveLength(2);
      }
    });

    it('should parse nested list', () => {
      const html = '<ul><li>Item 1<ul><li>Nested</li></ul></li></ul>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
      if (result[0].type === 'list') {
        expect(result[0].children).toHaveLength(1);
        const firstItem = result[0].children[0];
        if (firstItem.type === 'listitem') {
          const nestedList = firstItem.children.find((c) => c.type === 'list');
          expect(nestedList).toBeDefined();
        }
      }
    });
  });

  describe('table', () => {
    it('should parse a simple table', () => {
      const html = '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('table');
      if (result[0].type === 'table') {
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].type).toBe('tablerow');
        expect(result[0].children[0].children).toHaveLength(2);
      }
    });

    it('should parse table with header cells', () => {
      const html = '<table><tbody><tr><th>Header</th></tr></tbody></table>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      if (result[0].type === 'table') {
        const row = result[0].children[0];
        if (row.type === 'tablerow') {
          const cell = row.children[0];
          expect(cell.headerState).toBe(1);
        }
      }
    });
  });

  describe('image', () => {
    it('should parse an image', () => {
      const html = '<img src="https://example.com/image.png" alt="Alt text">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('image');
      if (result[0].type === 'image') {
        expect(result[0].src).toBe('https://example.com/image.png');
        expect(result[0].alt).toBe('Alt text');
      }
    });

    it('should parse an image with class attribute', () => {
      const html = '<img src="https://example.com/image.png" alt="Alt text" class="my-image">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('image');
      if (result[0].type === 'image') {
        expect(result[0].src).toBe('https://example.com/image.png');
        expect(result[0].alt).toBe('Alt text');
        expect(result[0].className).toBe('my-image');
      }
    });

    it('should parse an image with width and height', () => {
      const html =
        '<img src="https://example.com/image.png" alt="Alt text" width="800" height="600">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('image');
      if (result[0].type === 'image') {
        expect(result[0].src).toBe('https://example.com/image.png');
        expect(result[0].width).toBe(800);
        expect(result[0].height).toBe(600);
      }
    });

    it('should parse an image with width only', () => {
      const html = '<img src="https://example.com/image.png" alt="Alt text" width="800">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('image');
      if (result[0].type === 'image') {
        expect(result[0].width).toBe(800);
        expect(result[0].height).toBeUndefined();
      }
    });

    it('should parse an image with height only', () => {
      const html = '<img src="https://example.com/image.png" alt="Alt text" height="600">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('image');
      if (result[0].type === 'image') {
        expect(result[0].width).toBeUndefined();
        expect(result[0].height).toBe(600);
      }
    });
  });

  describe('figure', () => {
    it('should parse figure with image and caption', () => {
      const html =
        '<figure><img src="https://example.com/image.png" alt="Alt text"><figcaption>Caption text</figcaption></figure>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('figure');
      if (result[0].type === 'figure') {
        expect(result[0].image.src).toBe('https://example.com/image.png');
        expect(result[0].image.alt).toBe('Alt text');
        expect(result[0].caption).toBe('Caption text');
      }
    });

    it('should parse figure with image only (no caption)', () => {
      const html = '<figure><img src="https://example.com/image.png" alt="Alt text"></figure>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('figure');
      if (result[0].type === 'figure') {
        expect(result[0].image.src).toBe('https://example.com/image.png');
        expect(result[0].caption).toBeUndefined();
      }
    });

    it('should parse figure with image class attribute', () => {
      const html =
        '<figure><img src="https://example.com/image.png" alt="Alt text" class="my-image"><figcaption>Caption</figcaption></figure>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('figure');
      if (result[0].type === 'figure') {
        expect(result[0].image.className).toBe('my-image');
      }
    });

    it('should parse figure with image width and height', () => {
      const html =
        '<figure><img src="https://example.com/image.png" alt="Alt text" width="1024" height="768"><figcaption>Caption</figcaption></figure>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('figure');
      if (result[0].type === 'figure') {
        expect(result[0].image.width).toBe(1024);
        expect(result[0].image.height).toBe(768);
      }
    });

    it('should return null for figure without image', () => {
      const html = '<figure><figcaption>Caption only</figcaption></figure>';
      const result = parseHtml(html);

      expect(result).toHaveLength(0);
    });
  });

  describe('blockquote', () => {
    it('should parse a simple blockquote', () => {
      const html = '<blockquote><p>Quoted text</p></blockquote>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('quote');
      if (result[0].type === 'quote') {
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].type).toBe('paragraph');
      }
    });

    it('should parse blockquote with multiple paragraphs', () => {
      const html = '<blockquote><p>First</p><p>Second</p></blockquote>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('quote');
      if (result[0].type === 'quote') {
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0].type).toBe('paragraph');
        expect(result[0].children[1].type).toBe('paragraph');
      }
    });
  });

  describe('multiple elements', () => {
    it('should parse multiple paragraphs', () => {
      const html = '<p>First</p><p>Second</p>';
      const result = parseHtml(html);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('paragraph');
      expect(result[1].type).toBe('paragraph');
    });

    it('should parse mixed content', () => {
      const html = '<h1>Title</h1><p>Content</p><ul><li>Item</li></ul>';
      const result = parseHtml(html);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('heading');
      expect(result[1].type).toBe('paragraph');
      expect(result[2].type).toBe('list');
    });
  });

  describe('code block', () => {
    it('should parse pre/code block', () => {
      const html = '<pre><code>const x = 1;</code></pre>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('codeblock');
      if (result[0].type === 'codeblock') {
        expect(result[0].code).toBe('const x = 1;');
        expect(result[0].language).toBeUndefined();
      }
    });

    it('should parse pre/code block with language class', () => {
      const html = '<pre><code class="language-typescript">const x: number = 1;</code></pre>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('codeblock');
      if (result[0].type === 'codeblock') {
        expect(result[0].code).toBe('const x: number = 1;');
        expect(result[0].language).toBe('typescript');
      }
    });

    it('should parse pre without code element', () => {
      const html = '<pre>Plain preformatted text</pre>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('codeblock');
      if (result[0].type === 'codeblock') {
        expect(result[0].code).toBe('Plain preformatted text');
        expect(result[0].language).toBeUndefined();
      }
    });
  });

  describe('embed', () => {
    it('should parse embed element with all attributes', () => {
      const html =
        '<embed src="https://example.com/video.swf" type="application/x-shockwave-flash" width="640" height="480">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('embed');
      if (result[0].type === 'embed') {
        expect(result[0].src).toBe('https://example.com/video.swf');
        expect(result[0].embedType).toBe('application/x-shockwave-flash');
        expect(result[0].width).toBe('640');
        expect(result[0].height).toBe('480');
      }
    });

    it('should parse embed element with src only', () => {
      const html = '<embed src="https://example.com/content.pdf">';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('embed');
      if (result[0].type === 'embed') {
        expect(result[0].src).toBe('https://example.com/content.pdf');
        expect(result[0].embedType).toBeUndefined();
      }
    });
  });

  describe('object', () => {
    it('should parse object element with all attributes', () => {
      const html =
        '<object data="https://example.com/movie.swf" type="application/x-shockwave-flash" name="movie" width="640" height="480"></object>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('object');
      if (result[0].type === 'object') {
        expect(result[0].data).toBe('https://example.com/movie.swf');
        expect(result[0].objectType).toBe('application/x-shockwave-flash');
        expect(result[0].name).toBe('movie');
        expect(result[0].width).toBe('640');
        expect(result[0].height).toBe('480');
      }
    });

    it('should parse object element without data', () => {
      const html = '<object type="application/pdf" width="100%" height="600"></object>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('object');
      if (result[0].type === 'object') {
        expect(result[0].data).toBeUndefined();
        expect(result[0].objectType).toBe('application/pdf');
      }
    });
  });

  describe('empty input', () => {
    it('should return empty array for empty string', () => {
      const result = parseHtml('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      const result = parseHtml('   ');
      expect(result).toEqual([]);
    });
  });
});

describe('data-becraft-media', () => {
  describe('single media', () => {
    it('should parse single image with data-becraft-media', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" alt="Sample" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('media');
      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(1);
      expect(media.items[0].src).toBe('https://example.com/image.jpg');
      expect(media.items[0].alt).toBe('Sample');
    });

    it('should parse single image with width and height', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" width="800" height="600" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items[0].width).toBe(800);
      expect(media.items[0].height).toBe(600);
    });

    it('should parse single media with figcaption', () => {
      const html = `
        <div data-becraft-media>
          <figure>
            <img src="https://example.com/image.jpg" alt="Sample" />
            <figcaption>Caption text</figcaption>
          </figure>
        </div>
      `;
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items[0].caption).toBe('Caption text');
    });
  });

  describe('grid layout', () => {
    it('should parse grid layout with multiple images', () => {
      const html = `
        <div data-becraft-media style="display:grid; grid-template-rows:repeat(2,1fr); grid-template-columns:repeat(2,1fr);">
          <div data-media-key="img1" style="grid-row:1/2; grid-column:1/3;">
            <img src="https://example.com/1.jpg" alt="Image 1" />
          </div>
          <div data-media-key="img2" style="grid-row:2/3; grid-column:1/2;">
            <img src="https://example.com/2.jpg" alt="Image 2" />
          </div>
          <div data-media-key="img3" style="grid-row:2/3; grid-column:2/3;">
            <img src="https://example.com/3.jpg" alt="Image 3" />
          </div>
        </div>
      `;
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('media');
      const media = result[0] as MediaNode;

      expect(media.gridStyle).toBeDefined();
      expect(media.gridStyle?.rows).toBe('repeat(2,1fr)');
      expect(media.gridStyle?.cols).toBe('repeat(2,1fr)');

      expect(media.items).toHaveLength(3);
      expect(media.items[0].key).toBe('img1');
      expect(media.items[0].gridRow).toBe('1/2');
      expect(media.items[0].gridColumn).toBe('1/3');
      expect(media.items[1].key).toBe('img2');
      expect(media.items[2].key).toBe('img3');
    });

    it('should parse grid items with captions', () => {
      const html = `
        <div data-becraft-media style="display:grid; grid-template-rows:1fr; grid-template-columns:repeat(2,1fr);">
          <div data-media-key="img1">
            <img src="https://example.com/1.jpg" />
            <figcaption>First image</figcaption>
          </div>
          <div data-media-key="img2">
            <img src="https://example.com/2.jpg" />
            <figcaption>Second image</figcaption>
          </div>
        </div>
      `;
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      expect(media.items[0].caption).toBe('First image');
      expect(media.items[1].caption).toBe('Second image');
    });
  });

  describe('edge cases', () => {
    it('should handle empty data-becraft-media div', () => {
      const html = '<div data-becraft-media></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(0);
    });

    it('should not have gridStyle when no grid template is specified', () => {
      const html = '<div data-becraft-media><img src="https://example.com/image.jpg" /></div>';
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      expect(media.gridStyle).toBeUndefined();
    });

    it('should handle img with empty src', () => {
      const html = '<div data-becraft-media><img src="" alt="Empty src" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(1);
      expect(media.items[0].src).toBe('');
      expect(media.items[0].alt).toBe('Empty src');
    });

    it('should handle non-numeric width/height attributes', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" width="auto" height="100%" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(1);
      // Browser behavior: parseInt("auto") returns NaN, parseInt("100%") returns 100
      expect(media.items[0].width).toBeNaN();
      expect(media.items[0].height).toBe(100); // parseInt parses leading numeric portion
    });

    it('should handle zero width/height attributes', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" width="0" height="0" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items[0].width).toBe(0);
      expect(media.items[0].height).toBe(0);
    });

    it('should handle negative width/height attributes', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" width="-100" height="-50" /></div>';
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      expect(media.items[0].width).toBe(-100);
      expect(media.items[0].height).toBe(-50);
    });

    it('should prioritize data-media-key children over direct img', () => {
      const html = `
        <div data-becraft-media>
          <img src="https://example.com/direct.jpg" alt="Direct" />
          <div data-media-key="keyed">
            <img src="https://example.com/keyed.jpg" alt="Keyed" />
          </div>
        </div>
      `;
      const result = parseHtml(html);

      expect(result).toHaveLength(1);
      const media = result[0] as MediaNode;
      // data-media-key children should be used, not direct img
      expect(media.items).toHaveLength(1);
      expect(media.items[0].key).toBe('keyed');
      expect(media.items[0].src).toBe('https://example.com/keyed.jpg');
    });

    it('should handle only grid-template-rows without cols', () => {
      const html =
        '<div data-becraft-media style="grid-template-rows: 1fr 2fr;"><img src="https://example.com/image.jpg" /></div>';
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      // gridStyle requires both rows and cols
      expect(media.gridStyle).toBeUndefined();
    });

    it('should handle only grid-template-columns without rows', () => {
      const html =
        '<div data-becraft-media style="grid-template-columns: 1fr 2fr;"><img src="https://example.com/image.jpg" /></div>';
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      // gridStyle requires both rows and cols
      expect(media.gridStyle).toBeUndefined();
    });

    it('should skip data-media-key element without img', () => {
      const html = `
        <div data-becraft-media style="grid-template-rows:1fr; grid-template-columns:repeat(2,1fr);">
          <div data-media-key="no-img">
            <span>No image here</span>
          </div>
          <div data-media-key="with-img">
            <img src="https://example.com/image.jpg" />
          </div>
        </div>
      `;
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      // Only the element with img should be included
      expect(media.items).toHaveLength(1);
      expect(media.items[0].key).toBe('with-img');
    });

    it('should fallback to figure when no direct img', () => {
      const html = `
        <div data-becraft-media>
          <figure>
            <img src="https://example.com/figure-img.jpg" alt="Figure image" />
            <figcaption>Figure caption</figcaption>
          </figure>
        </div>
      `;
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(1);
      expect(media.items[0].src).toBe('https://example.com/figure-img.jpg');
      expect(media.items[0].caption).toBe('Figure caption');
    });

    it('should handle img with class attribute', () => {
      const html =
        '<div data-becraft-media><img src="https://example.com/image.jpg" class="custom-class another-class" /></div>';
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      expect(media.items[0].className).toBe('custom-class another-class');
    });

    it('should handle multiple grid items with varying attributes', () => {
      const html = `
        <div data-becraft-media style="grid-template-rows:1fr; grid-template-columns:repeat(3,1fr);">
          <div data-media-key="full" style="grid-row:1/2; grid-column:1/2;">
            <img src="https://example.com/1.jpg" alt="Full" width="100" height="100" class="img-full" />
            <figcaption>Full caption</figcaption>
          </div>
          <div data-media-key="partial">
            <img src="https://example.com/2.jpg" />
          </div>
          <div data-media-key="minimal">
            <img src="https://example.com/3.jpg" />
          </div>
        </div>
      `;
      const result = parseHtml(html);

      const media = result[0] as MediaNode;
      expect(media.items).toHaveLength(3);

      // First item: all attributes
      expect(media.items[0].key).toBe('full');
      expect(media.items[0].alt).toBe('Full');
      expect(media.items[0].width).toBe(100);
      expect(media.items[0].height).toBe(100);
      expect(media.items[0].className).toBe('img-full');
      expect(media.items[0].caption).toBe('Full caption');
      expect(media.items[0].gridRow).toBe('1/2');
      expect(media.items[0].gridColumn).toBe('1/2');

      // Second item: minimal attributes
      expect(media.items[1].key).toBe('partial');
      expect(media.items[1].alt).toBeUndefined();
      expect(media.items[1].width).toBeUndefined();

      // Third item: minimal attributes
      expect(media.items[2].key).toBe('minimal');
    });
  });
});
