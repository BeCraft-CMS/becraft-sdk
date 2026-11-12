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

// コンテンツを取得（既定は基本項目のみ。本文 HTML などは select で指定する）
const contents = await client.content().get({
  limit: 10,
  offset: 0,
  select: 'id,title,thumbnail,html',
});

// 関連コンテンツを取得（一覧と同じく select / statusKeys / order を指定できる）
const related = await client.content().relations({
  id: 'content-uuid',
  limit: 5,
  offset: 0,
});

// ID でコンテンツを検索（下書きを取得する場合は draftKey を渡す）
const content = await client.content().find({
  id: 'content-uuid',
});

// カテゴリを取得
const categories = await client.category().get({ limit: 10, offset: 0 });

// スラッグでカテゴリを取得・件数を数える
const [news] = await client.category().get({ limit: 1, offset: 0, slug: 'news' });
const categoryCount = await client.category().count();

// タグを取得
const tags = await client.tag().get({ limit: 10, offset: 0 });
```

`baseUrl` には BeCraft のオリジン（例: `https://your-becraft-api.com`）を指定する。
SDK は配信 API の `/api/v1/contents` などのパスを付与してリクエストする。

> **0.3.0 からの変更**: リクエスト先が `/api/...` から `/api/v1/...` に変わりました。`/api/v1` を提供しない旧バージョンの BeCraft には接続できません。

### タイムアウトとキャンセル

各メソッドは第 2 引数で `signal` を受け付ける。シグナルが中断されると HTTP リクエスト自体が切断される（待つのをやめるだけではない）。

```ts
import { FetchError, ResponseError } from '@becraft/sdk';

try {
  const contents = await client
    .content()
    .get({ limit: 10, offset: 0 }, { signal: AbortSignal.timeout(5000) });
} catch (e) {
  if (e instanceof DOMException && e.name === 'TimeoutError') {
    // AbortSignal.timeout による中断（AbortController.abort() の場合は AbortError）
  } else if (e instanceof ResponseError) {
    // 2xx 以外の応答。e.response.status で 4xx / 5xx を判別できる
  } else if (e instanceof FetchError) {
    // ネットワークエラーなど、応答を受け取れなかった。e.cause に元のエラー
  }
}
```

中断時は `fetch` と同じくシグナルの `reason`（`AbortError` / `TimeoutError`）で reject し、`FetchError` には包まない。

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

#### サーバーサイド（Node.js / Cloudflare Workers / Vercel Edge）

SSR 環境では `/server` エントリポイントを使用してください。利用するランタイムに応じて、パッケージが自動的に適切なバンドルを解決します（`linkedom`: Node.js / `linkedom/worker`: Cloudflare Workers / Vercel Edge Runtime）。

```ts
import { parseHtmlOnServer } from '@becraft/sdk/server';

const ast = parseHtmlOnServer('<p>Hello World</p>');
```

注意: サーバーサイドでの解析には `linkedom` がピア依存関係として必要です。

```bash
npm install linkedom
```

動作確認済みランタイム:

| ランタイム                                                                            |   対応    | 解決される実装                        |
| ------------------------------------------------------------------------------------- | :-------: | ------------------------------------- |
| Node.js                                                                               |    ✅     | `linkedom`                            |
| Cloudflare Workers（wrangler / `@cloudflare/vite-plugin` / `@opennextjs/cloudflare`） |    ✅     | `linkedom/worker`                     |
| Vercel Edge Runtime（Next.js Edge）                                                   |    ✅     | `linkedom/worker`                     |
| Bun / Deno                                                                            | ⚠️ 未検証 | `linkedom`（`import` フォールバック） |

> **0.2.0 からの変更**: 以前は `jsdom` を使用していましたが、V8 isolate 環境で動作しないため `linkedom` に置き換えました。0.1.x からアップグレードする場合は `jsdom` を削除して `linkedom` を追加してください。

## API

### BeCraftClient

- `content()` - コンテンツサービス
  - `get(request, options?)` - コンテンツ一覧を取得
  - `find(request, options?)` - ID でコンテンツを検索
  - `count(request, options?)` - コンテンツ数をカウント
- `category()` - カテゴリサービス
  - `get(request, options?)` - カテゴリ一覧を取得
  - `find(request, options?)` - ID でカテゴリを検索
- `tag()` - タグサービス
  - `get(request, options?)` - タグ一覧を取得
  - `find(request, options?)` - ID でタグを検索
  - `count(request, options?)` - タグ数をカウント

`options` は `BeCraftRequestOptions`（`{ signal?: AbortSignal }`）。

### エラー

- `ResponseError` - 2xx 以外の応答（`response` を保持）
- `FetchError` - 応答を受け取れなかった（`cause` に元のエラー）。中断時はこれではなく `AbortError` / `TimeoutError`

### HTML ユーティリティ

- `parseHtml(html: string)` - HTML を AST に解析（ブラウザ）
- `parseHtmlOnServer(html: string)` - HTML を AST に解析（Node.js / Cloudflare Workers / Vercel Edge, linkedom ベース）
- `BeCraftHTMLRenderer` - HTML をレンダリングする React コンポーネント

### 埋め込みタグ

BeCraft の埋め込みタグセクションに登録された HTML は、タグや属性を一切落とさずそのまま描画される。
配信 API の html では区間が HTML コメント（`<!-- #embedtag -->` / `<!-- /#embedtag -->`）で囲まれており、
パーサーはこの区間を `EmbedTagNode`（原文の HTML を保持）として扱う。

デフォルトの描画は `<div dangerouslySetInnerHTML>` による原文の挿入となる。
`<script>` は HTML 仕様上 `innerHTML` 経由では実行されないため、
スクリプトの実行が必要な埋め込み（HubSpot フォーム等）を扱う場合は
`embedTagNodeRenderer` で独自に処理する。

```tsx
<BeCraftHTMLRenderer
  nodes={nodes}
  config={{
    embedTagNodeRenderer: ({ node }) => <MyEmbed html={node.html} />,
  }}
/>
```

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
