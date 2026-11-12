export * from './client';

// Errors thrown by BeCraftClient. ResponseError: non-2xx response (inspect `response.status`).
// FetchError: the request did not complete, e.g. a network failure (inspect `cause`).
export { ResponseError, FetchError } from './api/runtime';

// API Types
export type { ApiContentResponse } from './api/models/ApiContentResponse';
export type { ApiContentListItem } from './api/models/ApiContentListItem';
export type { Content } from './api/models/Content';
export type { Category } from './api/models/Category';
export type { Tag } from './api/models/Tag';

export { parseHtml } from './parser/html-parser';
export * from './parser/nodes';

export { BeCraftHTMLRenderer } from './renderer/html-renderer';
export type { HTMLRendererConfig } from './renderer/html-renderer';
