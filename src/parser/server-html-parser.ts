import { JSDOM } from 'jsdom';
import { type ContentNode } from './nodes';
import { parseBodyContent } from './html-parser';

type ParseHTMLFn = (html: string) => {
  document: { body: Parameters<typeof parseBodyContent>[0] };
};

/**
 * Factory that builds a server-side HTML parser from a given DOM implementation.
 * Inject `parseHTML` from `linkedom` (or `linkedom/worker` on Cloudflare Workers)
 * to produce an environment-specific `parseHtmlOnServer`.
 */
export const makeParseHtmlOnServer =
  (parseHTML: ParseHTMLFn) =>
  (html: string): ContentNode[] => {
    const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
    return parseBodyContent(document.body);
  };

const jsdomParseHTML: ParseHTMLFn = (html) => {
  const dom = new JSDOM(html);
  return { document: dom.window.document };
};

export const parseHtmlOnServer = makeParseHtmlOnServer(jsdomParseHTML);
