import { describe, it, expect } from 'vitest';
import { parseHtmlOnServer } from './server';

describe('@becraft/sdk/server (Node.js entry — linkedom)', () => {
  it('parses a simple paragraph', () => {
    const result = parseHtmlOnServer('<p>Hello World</p>');

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('paragraph');
  });

  it('returns empty array for empty string', () => {
    expect(parseHtmlOnServer('')).toHaveLength(0);
  });
});
