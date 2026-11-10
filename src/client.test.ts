import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BeCraftClient } from './client';

// The delivery API lives under /api/v1 on the backend. Pin the request paths so
// that regenerating the client against a spec with a different prefix fails here.
describe('BeCraftClient request paths', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const jsonResponse = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const client = new BeCraftClient({
    baseUrl: 'https://cms.example.com/',
    apiKey: 'test-key',
  });

  const requestedUrl = () => new URL(fetchMock.mock.calls[0][0] as string);

  it.each([
    ['content().get', () => client.content().get({ offset: 0, limit: 10 }), '/api/v1/contents', []],
    ['content().count', () => client.content().count({}), '/api/v1/contents/count', 0],
    [
      'category().get',
      () => client.category().get({ offset: 0, limit: 10 }),
      '/api/v1/categories',
      [],
    ],
    ['tag().get', () => client.tag().get({ offset: 0, limit: 10 }), '/api/v1/tags', []],
    ['tag().count', () => client.tag().count({}), '/api/v1/tags/count', 0],
  ])('%s requests %s', async (_name, call, path, body) => {
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    await call();

    expect(requestedUrl().origin).toBe('https://cms.example.com');
    expect(requestedUrl().pathname).toBe(path);
  });

  it('sends the API key as a bearer token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    await client.tag().get({ offset: 0, limit: 10 });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
  });

  it('passes draft_key to the content detail endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: 'c1',
        title: 't',
        html: '',
        status: 'Published',
        draft_key: 'dk',
        categories: [],
        tags: [],
        related_contents: [],
        custom_parameters: {},
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        created_by: { id: 'u1', name: 'n' },
        updated_by: { id: 'u1', name: 'n' },
      }),
    );

    await client.content().find({ id: 'c1', draftKey: 'dk' });

    expect(requestedUrl().pathname).toBe('/api/v1/contents/c1');
    expect(requestedUrl().searchParams.get('draft_key')).toBe('dk');
  });
});
