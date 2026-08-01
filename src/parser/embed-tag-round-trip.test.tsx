import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseHTML } from 'linkedom';
import { makeParseHtmlOnServer } from './server-html-parser';
import { BeCraftHTMLRenderer } from '../renderer/html-renderer';

const parseHtmlOnServer = makeParseHtmlOnServer(parseHTML as never);

/**
 * 「埋め込みタグに登録した HTML がそのまま表示される」という仕様の回帰テスト。
 * 配信 API の html と同じ形（区間マーカー + 前後の本文）を入力に、
 * パースから描画までを通して原文が保たれることを確認する。
 *
 * 対応: apps/serverside/interface/src/renderer/embed_tag.rs
 *       specs/content/embed_tag.als (MarkerBasedPassthrough)
 */
describe('embed tag round trip', () => {
  const deliver = (embed: string) =>
    `<p>before</p><!-- #embedtag -->${embed}<!-- /#embedtag --><p>after</p>`;

  const renderDelivered = (embed: string) => {
    const nodes = parseHtmlOnServer(deliver(embed));
    expect(nodes.map((node) => node.type)).toEqual(['paragraph', 'embedtag', 'paragraph']);
    return renderToStaticMarkup(<BeCraftHTMLRenderer nodes={nodes} />);
  };

  it('should keep the attributes YouTube needs', () => {
    const html = renderDelivered(
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/abc" ' +
        'title="YouTube video player" frameborder="0" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    );

    expect(html).toContain('frameborder="0"');
    expect(html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
    expect(html).toContain('allow="accelerometer; autoplay; clipboard-write; encrypted-media"');
    expect(html).toContain('title="YouTube video player"');
  });

  it('should keep the attributes Google Maps needs', () => {
    const html = renderDelivered(
      '<iframe src="https://www.google.com/maps/embed?pb=xxx" width="600" height="450" ' +
        'style="border:0;" allowfullscreen="" loading="lazy" ' +
        'referrerpolicy="no-referrer-when-downgrade"></iframe>',
    );

    expect(html).toContain('style="border:0;"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('referrerpolicy="no-referrer-when-downgrade"');
  });

  it('should keep a script based embed that used to disappear entirely', () => {
    const html = renderDelivered(
      '<div class="hs-form-frame" data-region="na1" data-form-id="1" data-portal-id="2"></div>' +
        '<script charset="utf-8" src="https://js.hsforms.net/forms/embed/v2.js"></script>',
    );

    expect(html).toContain('class="hs-form-frame"');
    expect(html).toContain('data-form-id="1"');
    expect(html).toContain(
      '<script charset="utf-8" src="https://js.hsforms.net/forms/embed/v2.js">',
    );
  });

  it('should keep both the quote and the widget script of an X embed', () => {
    const html = renderDelivered(
      '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">tweet</p>' +
        '<a href="https://twitter.com/x/status/1">2026</a></blockquote>' +
        '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
    );

    expect(html).toContain('class="twitter-tweet"');
    expect(html).toContain('src="https://platform.twitter.com/widgets.js"');
  });

  it('should leave the surrounding content parsed as usual', () => {
    const html = renderDelivered('<div>embed</div>');

    expect(html).toContain('<p>before</p>');
    expect(html).toContain('<p>after</p>');
  });
});
