# becraft-sdk

SDK for interacting with the BeCraft backend APIs.

## Install

```bash
npm install becraft-sdk
```

## Usage

### Basic Client

```ts
import { BeCraftClient } from 'becraft-sdk';

const client = new BeCraftClient({
  baseUrl: 'https://your-becraft-api.com',
  apiKey: 'your-api-key',
});

// Get contents
const contents = await client.content().get({
  limit: 10,
  offset: 0,
});

// Find a single content by ID
const content = await client.content().find({
  contentId: 'content-uuid',
});

// Get categories
const categories = await client.category().get({});

// Get tags
const tags = await client.tag().get({});
```

### HTML Rendering

The SDK provides utilities for parsing and rendering HTML content from the BeCraft editor.

#### Client-side (Browser)

```tsx
import { parseHtml, BeCraftHTMLRenderer } from 'becraft-sdk';

// Parse HTML string to AST
const ast = parseHtml('<p>Hello <strong>World</strong></p>');

// Render with React component
function ArticleContent({ html }: { html: string }) {
  return <BeCraftHTMLRenderer html={html} />;
}
```

#### Server-side (Node.js)

For SSR environments, use the `/server` entry point which uses jsdom:

```ts
import { parseHtmlOnServer } from 'becraft-sdk/server';

const ast = parseHtmlOnServer('<p>Hello World</p>');
```

Note: `jsdom` is a peer dependency for server-side parsing.

## API

### BeCraftClient

- `content()` - Content service
  - `get(request)` - Get list of contents
  - `find(request)` - Find single content by ID
  - `count(request)` - Count contents
- `category()` - Category service
  - `get(request)` - Get list of categories
  - `find(request)` - Find single category by ID
- `tag()` - Tag service
  - `get(request)` - Get list of tags
  - `find(request)` - Find single tag by ID
  - `count(request)` - Count tags

### HTML Utilities

- `parseHtml(html: string)` - Parse HTML to AST (browser)
- `parseHtmlOnServer(html: string)` - Parse HTML to AST (Node.js with jsdom)
- `BeCraftHTMLRenderer` - React component for rendering HTML

## Types

```ts
import type { Content, Category, Tag, ApiContentResponse } from 'becraft-sdk';
```

## Scripts

- `build` - Build the package
- `dev` - Watch mode for development
- `test` - Run tests
- `lint` - Run ESLint
- `format` - Format code with Prettier

## License

MIT
