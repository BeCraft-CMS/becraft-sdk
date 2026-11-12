# Changelog

All notable changes to `@becraft/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-11-12

### ⚠ BREAKING CHANGES

- `content().get()` now returns `ApiContentListItem[]` instead of
  `ApiContentResponse[]`. By default the backend returns only the basic fields
  (`id`, `title`, `status_key`, `status_name`, `is_public`, `published_at`,
  `custom_url`, `categories`, `tags`, `thumbnail`, `created_at`, `updated_at`);
  `html`, `seo`, `custom_parameters`, `related_content_ids`, `created_by` and
  `updated_by` are returned only when listed in the new `select` parameter
  (e.g. `select: 'id,title,html'`). Every field of `ApiContentListItem` is
  optional.
- The category field `apiIdentifier` (`api_identifier`) is renamed to `slug`
  on `Category`, `CreateCategoryJson` and `UpdateCategoryJson`, following the
  backend.

### Added

- `content().relations({ id, offset, limit })` fetches the contents related to
  a content (`GET /api/v1/contents/{id}/relations`). It accepts the same
  `statusKeys` / `select` / `order` as `content().get()` and returns
  `ApiContentListItem[]`.
- `content().get()` accepts `select` and `order` (`updated_at_desc` (default)
  or `id_desc`).
- `category().count()` (`GET /api/v1/categories/count`).
- `category().findBySlug({ slug })` fetches a category by its slug
  (`GET /api/v1/categories/slug/{slug}`). Slugs are unique within a tenant.
- `ApiContentListItem` is exported from the package entry.
- Every `BeCraftClient` method accepts an optional second argument
  `options: BeCraftRequestOptions` with `signal?: AbortSignal`. Aborting the
  signal (e.g. `AbortSignal.timeout(ms)`) cancels the underlying HTTP request
  instead of only abandoning the promise. The promise rejects with the
  signal's reason (`AbortError` / `TimeoutError`), as `fetch` does, rather than
  a `FetchError`.
- `ResponseError` and `FetchError` are exported from the package entry so that
  callers can distinguish non-2xx responses (`response.status`) from requests
  that never got a response.

## [0.3.0] - 2026-11-10

### ⚠ BREAKING CHANGES

- The API client is regenerated from the latest BeCraft OpenAPI spec. The
  delivery API is now requested under `/api/v1` (`/api/v1/contents`,
  `/api/v1/categories`, `/api/v1/tags`) instead of `/api`, matching the
  backend, which no longer serves the old paths. Older backends that only
  serve `/api/...` are not supported by this version.

### Added

- `customParameters` on `Content` / `ApiContentResponse` and as an optional
  field on `CreateContentJson` / `UpdateContentJson`.
- `alt` / `caption` / `class` (`_class`) / `width` / `height` on `Media`.
- `TableOfContents` value in `FieldType`.
- Support for the BeCraft **埋め込みリンク (bookmark) ノード**. The parser now
  recognizes the `<a class="bookmark-card">` markup emitted by the backend's
  `bookmark_to_html` and produces a new `BookmarkNode` (`type: 'bookmark'`)
  carrying `url` / `title` / `description` / `thumbnailUrl` / `faviconUrl`.
  `BeCraftHTMLRenderer` renders it with the same `bookmark-card` BEM structure,
  and a `bookmarkNodeRenderer` override is available via `HTMLRendererConfig`.
  Bookmarks without OGP metadata fall back to a plain anchor, matching the
  backend output.
- Support for BeCraft **埋め込みタグ (embed tag)** sections. The parser detects
  regions delimited by `<!-- #embedtag -->` / `<!-- /#embedtag -->` in the
  delivery API html and produces a new `EmbedTagNode` holding the original
  HTML. `BeCraftHTMLRenderer` renders it verbatim (attributes such as
  `frameborder` / `referrerpolicy` are no longer dropped), and an
  `embedTagNodeRenderer` override is available via `HTMLRendererConfig` for
  embeds that need `<script>` execution. A start marker without a matching end
  marker is not treated as a region.

## [0.2.0] - 2026-04-23

### ⚠ BREAKING CHANGES

- The peer dependency for `@becraft/sdk/server` changed from `jsdom` to
  `linkedom`. Consumers that use the server-side HTML parser must update
  their dependencies:

  ```bash
  npm remove jsdom
  npm install linkedom
  ```

  The `parseHtmlOnServer` signature and return value are unchanged.

### Added

- Support for server-side rendering on Cloudflare Workers, Vercel Edge
  Runtime, and any V8 isolate–based runtime that honors the `workerd`,
  `edge-light`, or `worker` export conditions ([#2]).
- New `@becraft/sdk/server` bundle variant (`server.worker.js`) that uses
  `linkedom/worker` and is selected automatically by consumer bundlers
  via `package.json` exports conditions.
- `makeParseHtmlOnServer` factory in `src/parser/server-html-parser.ts`
  decouples the parser from the concrete DOM implementation.

### Changed

- The main entry `exports["."]` now uses the `default` condition instead
  of `require` to accurately reflect that this package is ESM-only.

### Fixed

- SSR on Cloudflare Workers no longer fails with
  `Error: require is not defined in ES module scope`. The root cause
  was `jsdom`'s reliance on Node.js–only APIs (`vm`, `fs`, dynamic
  `require()`) which are unavailable in V8 isolates ([#2]).

## [0.1.2] - 2026-02-17

Previous releases are not documented here. See the
[GitHub Releases](https://github.com/BeCraft-CMS/becraft-sdk/releases)
page for release artifacts.

[unreleased]: https://github.com/BeCraft-CMS/becraft-sdk/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/BeCraft-CMS/becraft-sdk/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/BeCraft-CMS/becraft-sdk/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BeCraft-CMS/becraft-sdk/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/BeCraft-CMS/becraft-sdk/releases/tag/v0.1.2
[#2]: https://github.com/BeCraft-CMS/becraft-sdk/issues/2
