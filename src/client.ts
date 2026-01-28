import { ApiContentsApi, Configuration, ApiCategoriesApi, ApiTagsApi } from './api';

import type {
  GetContentsRequest,
  FindContentRequest,
  CountContentsRequest,
  GetTagsRequest,
  FindTagRequest,
  CountTagsRequest,
  GetCategoriesRequest,
  FindCategoryRequest,
} from './api';

export type BeCraftClientOptions = {
  baseUrl: string;
  apiKey: string;
};

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

  get(request: GetContentsRequest) {
    return this.client.getContents(request);
  }

  count(request: CountContentsRequest) {
    return this.client.countContents(request);
  }

  find(request: FindContentRequest) {
    return this.client.findContent(request);
  }
}

class CategoryService {
  private client: ApiCategoriesApi;

  constructor(config: Configuration) {
    this.client = new ApiCategoriesApi(config);
  }

  get(request: GetCategoriesRequest) {
    return this.client.getCategories(request);
  }

  find(request: FindCategoryRequest) {
    return this.client.findCategory(request);
  }
}

class TagService {
  private client: ApiTagsApi;

  constructor(config: Configuration) {
    this.client = new ApiTagsApi(config);
  }

  get(request: GetTagsRequest) {
    return this.client.getTags(request);
  }

  count(request: CountTagsRequest) {
    return this.client.countTags(request);
  }

  find(request: FindTagRequest) {
    return this.client.findTag(request);
  }
}
