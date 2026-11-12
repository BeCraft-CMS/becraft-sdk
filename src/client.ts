import { ApiContentsApi, Configuration, ApiCategoriesApi, ApiTagsApi, FetchError } from './api';

import type {
  GetContentsRequest,
  FindContentRequest,
  CountContentsRequest,
  GetContentRelationsRequest,
  GetTagsRequest,
  FindTagRequest,
  CountTagsRequest,
  GetCategoriesRequest,
  CountCategoriesRequest,
  FindCategoryRequest,
} from './api';

export type BeCraftClientOptions = {
  baseUrl: string;
  apiKey: string;
};

/**
 * Per-request options accepted by every `BeCraftClient` method.
 */
export type BeCraftRequestOptions = {
  /**
   * Aborts the underlying HTTP request when signalled, e.g. `AbortSignal.timeout(5000)`.
   * The returned promise rejects with the signal's reason (`AbortError` / `TimeoutError`),
   * the same as `fetch`.
   */
  signal?: AbortSignal;
};

// The generated runtime wraps every fetch rejection in FetchError, which hides an abort
// behind the same error type as a network failure. Surface the abort as `fetch` does so
// that callers can tell "I cancelled this" apart from "the request failed".
async function call<T>(
  options: BeCraftRequestOptions | undefined,
  request: (init: RequestInit | undefined) => Promise<T>,
): Promise<T> {
  const signal = options?.signal;
  try {
    return await request(signal ? { signal } : undefined);
  } catch (error) {
    if (error instanceof FetchError && signal?.aborted) {
      throw signal.reason ?? error.cause;
    }
    throw error;
  }
}

export class BeCraftClient {
  protected config: Configuration;

  constructor(options: BeCraftClientOptions) {
    this.config = new Configuration({
      basePath: options.baseUrl.replace(/\/$/, ''),
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
    });
  }

  content() {
    return new ContentService(this.config);
  }

  category() {
    return new CategoryService(this.config);
  }

  tag() {
    return new TagService(this.config);
  }
}

class ContentService {
  private client: ApiContentsApi;

  constructor(config: Configuration) {
    this.client = new ApiContentsApi(config);
  }

  get(request: GetContentsRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.getContents(request, init));
  }

  count(request: CountContentsRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.countContents(request, init));
  }

  find(request: FindContentRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.findContent(request, init));
  }

  relations(request: GetContentRelationsRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.getContentRelations(request, init));
  }
}

class CategoryService {
  private client: ApiCategoriesApi;

  constructor(config: Configuration) {
    this.client = new ApiCategoriesApi(config);
  }

  get(request: GetCategoriesRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.getCategories(request, init));
  }

  count(request: CountCategoriesRequest = {}, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.countCategories(request, init));
  }

  find(request: FindCategoryRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.findCategory(request, init));
  }
}

class TagService {
  private client: ApiTagsApi;

  constructor(config: Configuration) {
    this.client = new ApiTagsApi(config);
  }

  get(request: GetTagsRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.getTags(request, init));
  }

  count(request: CountTagsRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.countTags(request, init));
  }

  find(request: FindTagRequest, options?: BeCraftRequestOptions) {
    return call(options, (init) => this.client.findTag(request, init));
  }
}
