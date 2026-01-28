import { JSDOM } from 'jsdom';
import { type ContentNode } from './nodes';
import { parseBodyContent } from './html-parser';

/**
 * Parse HTML string into ContentNode array on the server side using jsdom.
 * This function is designed for server-side usage (SSR, API routes, etc.)
 * and requires jsdom as a peer dependency.
 *
 * For client-side usage, use `parseHtml` from 'becraft-sdk' instead.
 *
 * @param html - HTML string to parse
 * @returns Array of ContentNode
 */
export const parseHtmlOnServer = (html: string): ContentNode[] => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return parseBodyContent(dom.window.document.body);
};
