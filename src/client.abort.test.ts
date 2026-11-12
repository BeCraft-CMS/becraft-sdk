// @vitest-environment node
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BeCraftClient, FetchError, ResponseError } from './index';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Resolves only when the request's signal aborts, like a real fetch to a stalled server.
const hangUntilAborted = (_url: string, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    // fetch rejects immediately for a signal that is already aborted.
    if (init?.signal?.aborted) return reject(init.signal.reason);
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
  });

describe('BeCraftClient request options', () => {
  const fetchMock = vi.fn();
  const client = new BeCraftClient({ baseUrl: 'https://cms.example.com', apiKey: 'k' });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastInit = () => fetchMock.mock.calls[0][1] as RequestInit;

  it.each([
    [
      'content().get',
      (o: { signal: AbortSignal }) => client.content().get({ offset: 0, limit: 1 }, o),
      [],
    ],
    ['content().count', (o: { signal: AbortSignal }) => client.content().count({}, o), 0],
    ['content().find', (o: { signal: AbortSignal }) => client.content().find({ id: 'c1' }, o), {}],
    [
      'content().relations',
      (o: { signal: AbortSignal }) =>
        client.content().relations({ id: 'c1', offset: 0, limit: 1 }, o),
      [],
    ],
    [
      'category().get',
      (o: { signal: AbortSignal }) => client.category().get({ offset: 0, limit: 1 }, o),
      [],
    ],
    ['category().count', (o: { signal: AbortSignal }) => client.category().count({}, o), 0],
    ['category().find', (o: { signal: AbortSignal }) => client.category().find({ id: 'x' }, o), {}],
    ['tag().get', (o: { signal: AbortSignal }) => client.tag().get({ offset: 0, limit: 1 }, o), []],
    ['tag().count', (o: { signal: AbortSignal }) => client.tag().count({}, o), 0],
    ['tag().find', (o: { signal: AbortSignal }) => client.tag().find({ id: 'x' }, o), {}],
  ])('%s passes the signal to fetch', async (_name, call, body) => {
    fetchMock.mockResolvedValueOnce(jsonResponse(body));
    const { signal } = new AbortController();

    await call({ signal }).catch(() => {
      // Model parsing of the minimal bodies is irrelevant here.
    });

    expect(lastInit().signal).toBe(signal);
  });

  it('sends no signal when options are omitted', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    await client.tag().get({ offset: 0, limit: 1 });

    expect(lastInit().signal).toBeUndefined();
  });

  it('rejects with AbortError, not FetchError, when aborted', async () => {
    fetchMock.mockImplementationOnce(hangUntilAborted);
    const controller = new AbortController();

    const pending = client.tag().get({ offset: 0, limit: 1 }, { signal: controller.signal });
    controller.abort();

    const error = await pending.catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(FetchError);
    expect(error).toMatchObject({ name: 'AbortError' });
  });

  it('rejects with the signal reason for AbortSignal.timeout', async () => {
    fetchMock.mockImplementationOnce(hangUntilAborted);

    const error = await client
      .tag()
      .get({ offset: 0, limit: 1 }, { signal: AbortSignal.timeout(10) })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({ name: 'TimeoutError' });
  });

  it('keeps FetchError for network failures that are not aborts', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    const { signal } = new AbortController();

    const error = await client
      .tag()
      .get({ offset: 0, limit: 1 }, { signal })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(FetchError);
    expect((error as FetchError).cause).toBeInstanceOf(TypeError);
  });

  it('throws ResponseError carrying the status for non-2xx responses', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'boom' }, 503));

    const error = await client
      .tag()
      .get({ offset: 0, limit: 1 })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).response.status).toBe(503);
  });
});

// Against a real socket: aborting must close the connection, not just stop waiting.
describe('BeCraftClient abort against a stalled server', () => {
  let server: Server;
  let baseUrl: string;
  let closed: Promise<void>;

  beforeAll(async () => {
    let onClosed: () => void;
    closed = new Promise((resolve) => (onClosed = resolve));
    server = createServer((req: IncomingMessage) => {
      // Never respond; record when the client drops the connection.
      req.socket.on('close', () => onClosed());
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  it('closes the connection when the signal times out', async () => {
    const client = new BeCraftClient({ baseUrl, apiKey: 'k' });

    const error = await client
      .content()
      .get({ offset: 0, limit: 1 }, { signal: AbortSignal.timeout(50) })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({ name: 'TimeoutError' });
    await expect(closed).resolves.toBeUndefined();
  });
});
