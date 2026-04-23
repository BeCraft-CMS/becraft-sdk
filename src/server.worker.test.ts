import { describe, it, expect } from 'vitest';
import { parseHtmlOnServer } from './server.worker';

describe('@becraft/sdk/server (Cloudflare Workers / Edge entry — linkedom/worker)', () => {
  it('parses a simple paragraph', () => {
    const result = parseHtmlOnServer('<p>Hello World</p>');

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('paragraph');
  });

  it('returns empty array for empty string', () => {
    expect(parseHtmlOnServer('')).toHaveLength(0);
  });
});
