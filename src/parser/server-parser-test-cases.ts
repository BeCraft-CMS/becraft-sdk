import { describe, it, expect } from 'vitest';
import { type ContentNode } from './nodes';

/**
 * Shared regression suite for any `parseHtmlOnServer` built on top of
 * `makeParseHtmlOnServer`. Invoked from both the Node-pool test (with
 * `linkedom`) and the workerd-pool test (with `linkedom/worker`) so we
 * know the full parser behaves identically in both bundles.
 */
export const runServerParserTests = (
  label: string,
  parseHtmlOnServer: (html: string) => ContentNode[],
) => {
  describe(label, () => {
    it('should parse a simple paragraph', () => {
      const result = parseHtmlOnServer('<p>Hello World</p>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
    });

    it('should parse text with formatting', () => {
      const result = parseHtmlOnServer('<p><strong>Bold</strong> and <em>italic</em></p>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
      if (result[0].type === 'paragraph') {
        expect(result[0].children).toHaveLength(3);
        expect(result[0].children[0].type).toBe('text');
        if (result[0].children[0].type === 'text') {
          expect(result[0].children[0].textFormats).toContain('bold');
        }
      }
    });

    it('should parse headings', () => {
      const result = parseHtmlOnServer('<h1>Title</h1><h2>Subtitle</h2>');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('heading');
      expect(result[1].type).toBe('heading');
      if (result[0].type === 'heading' && result[1].type === 'heading') {
        expect(result[0].tag).toBe('h1');
        expect(result[1].tag).toBe('h2');
      }
    });

    it('should parse unordered lists', () => {
      const result = parseHtmlOnServer('<ul><li>Item 1</li><li>Item 2</li></ul>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
      if (result[0].type === 'list') {
        expect(result[0].tag).toBe('ul');
        expect(result[0].children).toHaveLength(2);
      }
    });

    it('should parse ordered lists', () => {
      const result = parseHtmlOnServer('<ol><li>First</li><li>Second</li></ol>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
      if (result[0].type === 'list') {
        expect(result[0].tag).toBe('ol');
      }
    });

    it('should parse links', () => {
      const result = parseHtmlOnServer('<p><a href="https://example.com">Link</a></p>');

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('link');
        if (result[0].children[0].type === 'link') {
          expect(result[0].children[0].url).toBe('https://example.com');
        }
      }
    });

    it('should parse images', () => {
      const result = parseHtmlOnServer('<p><img src="image.jpg" alt="Test" /></p>');

      expect(result).toHaveLength(1);
      if (result[0].type === 'paragraph') {
        expect(result[0].children[0].type).toBe('image');
        if (result[0].children[0].type === 'image') {
          expect(result[0].children[0].src).toBe('image.jpg');
          expect(result[0].children[0].alt).toBe('Test');
        }
      }
    });

    it('should parse tables', () => {
      const result = parseHtmlOnServer(`
        <table>
          <tr><th>Header</th></tr>
          <tr><td>Cell</td></tr>
        </table>
      `);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('table');
    });

    it('should parse blockquotes', () => {
      const result = parseHtmlOnServer('<blockquote><p>Quote text</p></blockquote>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('quote');
    });

    it('should parse iframes', () => {
      const result = parseHtmlOnServer(
        '<iframe src="https://example.com" width="640" height="360"></iframe>',
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('iframe');
      if (result[0].type === 'iframe') {
        expect(result[0].src).toBe('https://example.com');
      }
    });

    it('should parse video elements', () => {
      const result = parseHtmlOnServer('<video src="video.mp4" controls></video>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('video');
    });

    it('should parse audio elements', () => {
      const result = parseHtmlOnServer('<audio src="audio.mp3" controls></audio>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('audio');
    });

    it('should parse bookmark cards', () => {
      const result = parseHtmlOnServer(
        '<a class="bookmark-card" href="https://example.com/article" rel="noopener noreferrer" target="_blank">' +
          '<div class="bookmark-card__thumbnail"><img src="https://example.com/thumb.png" alt=""></div>' +
          '<div class="bookmark-card__body">' +
          '<p class="bookmark-card__title">Example Title</p>' +
          '<p class="bookmark-card__description">Example description</p>' +
          '<div class="bookmark-card__footer">' +
          '<img class="bookmark-card__favicon" src="https://example.com/favicon.ico" alt="">' +
          '<span class="bookmark-card__url">https://example.com/article</span>' +
          '</div></div></a>',
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('bookmark');
      if (result[0].type === 'bookmark') {
        expect(result[0].url).toBe('https://example.com/article');
        expect(result[0].title).toBe('Example Title');
        expect(result[0].description).toBe('Example description');
        expect(result[0].thumbnailUrl).toBe('https://example.com/thumb.png');
        expect(result[0].faviconUrl).toBe('https://example.com/favicon.ico');
      }
    });

    it('should return empty array for empty string', () => {
      const result = parseHtmlOnServer('');

      expect(result).toHaveLength(0);
    });

    it('should handle nested lists', () => {
      const result = parseHtmlOnServer(`
        <ul>
          <li>Item 1
            <ul>
              <li>Nested 1</li>
            </ul>
          </li>
        </ul>
      `);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('list');
    });
    it('should keep the registered html of an embed tag region as-is', () => {
      const result = parseHtmlOnServer(
        '<!-- #embedtag -->' +
          '<div class="hs-form-frame" data-form-id="xxx"></div>' +
          '<script charset="utf-8" src="https://js.hsforms.net/forms/embed/v2.js"></script>' +
          '<!-- /#embedtag -->',
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('embedtag');
      if (result[0].type === 'embedtag') {
        expect(result[0].html).toContain('<script');
        expect(result[0].html).toContain('data-form-id="xxx"');
      }
    });

    it('should not let an embed tag region swallow the surrounding content', () => {
      const result = parseHtmlOnServer(
        '<p>before</p><!-- #embedtag --><div>embed</div><!-- /#embedtag --><p>after</p>',
      );

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('paragraph');
      expect(result[1].type).toBe('embedtag');
      expect(result[2].type).toBe('paragraph');
    });

    it('should ignore an embed tag start marker without an end marker', () => {
      const result = parseHtmlOnServer('<!-- #embedtag --><p>after</p>');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('paragraph');
    });
  });
};
