import { type ContentNode } from './nodes';
import { parseBodyContent } from './html-parser';

type ParseHTMLFn = (html: string) => {
  document: { body: Parameters<typeof parseBodyContent>[0] };
};

/**
 * Factory that builds a server-side HTML parser from a given DOM implementation.
 * Inject `parseHTML` from `linkedom` (Node.js) or `linkedom/worker`
 * (Cloudflare Workers / Vercel Edge) to produce an environment-specific parser.
 */
export const makeParseHtmlOnServer =
  (parseHTML: ParseHTMLFn) =>
  (html: string): ContentNode[] => {
    const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
    return parseBodyContent(document.body);
  };
