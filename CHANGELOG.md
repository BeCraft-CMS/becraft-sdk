# Changelog

All notable changes to `@becraft/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- Internal file `src/client.ts` renamed to `src/becraft-client.ts` to
  make its role (the `BeCraftClient` API client) explicit. The public
  export surface via `@becraft/sdk` is unchanged.
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

[0.2.0]: https://github.com/BeCraft-CMS/becraft-sdk/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/BeCraft-CMS/becraft-sdk/releases/tag/v0.1.2
[#2]: https://github.com/BeCraft-CMS/becraft-sdk/issues/2
