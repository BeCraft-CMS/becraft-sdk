# becraft-sdk

BeCraft バックエンド API クライアントと HTML パーサー/レンダラーを提供する SDK です。

## インストール

```bash
npm install @becraft/sdk
```

## 使い方

### 基本的なクライアント

```ts
import { BeCraftClient } from '@becraft/sdk';

const client = new BeCraftClient({
  baseUrl: 'https://your-becraft-api.com',
  apiKey: 'your-api-key',
});

// コンテンツを取得
const contents = await client.content().get({
  limit: 10,
  offset: 0,
});

// ID でコンテンツを検索
const content = await client.content().find({
  contentId: 'content-uuid',
});

// カテゴリを取得
const categories = await client.category().get({});

// タグを取得
const tags = await client.tag().get({});
```

### HTML レンダリング

SDK は BeCraft エディタからの HTML コンテンツを解析・レンダリングするためのユーティリティを提供しています。

#### クライアントサイド（ブラウザ）

```tsx
import { parseHtml, BeCraftHTMLRenderer } from '@becraft/sdk';

// HTML 文字列を AST に解析
const ast = parseHtml('<p>Hello <strong>World</strong></p>');

// React コンポーネントでレンダリング
function ArticleContent({ html }: { html: string }) {
  return <BeCraftHTMLRenderer html={html} />;
}
```

#### サーバーサイド（Node.js）

SSR 環境では、jsdom を使用する `/server` エントリポイントを使用してください：

```ts
import { parseHtmlOnServer } from '@becraft/sdk/server';

const ast = parseHtmlOnServer('<p>Hello World</p>');
```

注意: サーバーサイドでの解析には `jsdom` がピア依存関係として必要です。

## API

### BeCraftClient

- `content()` - コンテンツサービス
  - `get(request)` - コンテンツ一覧を取得
  - `find(request)` - ID でコンテンツを検索
  - `count(request)` - コンテンツ数をカウント
- `category()` - カテゴリサービス
  - `get(request)` - カテゴリ一覧を取得
  - `find(request)` - ID でカテゴリを検索
- `tag()` - タグサービス
  - `get(request)` - タグ一覧を取得
  - `find(request)` - ID でタグを検索
  - `count(request)` - タグ数をカウント

### HTML ユーティリティ

- `parseHtml(html: string)` - HTML を AST に解析（ブラウザ）
- `parseHtmlOnServer(html: string)` - HTML を AST に解析（Node.js + jsdom）
- `BeCraftHTMLRenderer` - HTML をレンダリングする React コンポーネント

## 型定義

```ts
import type { Content, Category, Tag, ApiContentResponse } from '@becraft/sdk';
```

## スクリプト

- `build` - パッケージをビルド
- `dev` - 開発用ウォッチモード
- `test` - テストを実行
- `lint` - ESLint を実行
- `format` - Prettier でコードをフォーマット

## ライセンス

MIT
