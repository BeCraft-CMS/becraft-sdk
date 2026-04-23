# Issue #2 調査レポート: jsdom が Cloudflare Workers (V8 isolate) で動かない問題

- 関連 Issue: [BeCraft-CMS/becraft-sdk#2](https://github.com/BeCraft-CMS/becraft-sdk/issues/2)
- 調査日: 2026-04-23
- 対象バージョン: `@becraft/sdk@0.1.2`
- ステータス: **調査完了 / 実装は別タスク**

## 1. 現象

`@becraft/sdk/server` エントリが提供する `parseHtmlOnServer` を Cloudflare Workers（V8 isolate, strict ESM）上で呼び出すと、以下のエラーで SSR が失敗する。

```
installHook.js:1 Error: require is not defined in ES module scope, you can use import instead
```

Node.js 環境では正常に動作する。エラーは Cloudflare Workers / Cloudflare Pages Functions（ESM Worker 形式）で発生する。

## 2. 影響範囲

| 項目 | 内容 |
|------|------|
| エントリポイント | `src/server.ts`（`@becraft/sdk/server` として公開） |
| 問題のファイル | `src/parser/server-html-parser.ts:1` — `import { JSDOM } from 'jsdom'` |
| 公開 API | `parseHtmlOnServer(html: string): ContentNode[]` |
| ピア依存関係 | `package.json` — `peerDependencies.jsdom: ^26.0.0`（optional） |
| ビルド設定 | `vite.config.ts` — `rollupOptions.external` に `jsdom` 指定 |
| 既存テスト | `src/parser/server-html-parser.test.ts`（Node 環境でのみ実行） |

`parseHtml`（クライアント用、`DOMParser` ベース）は影響を受けない。

## 3. 根本原因

`jsdom` は Node.js 専用ライブラリで、以下の Node.js 固有 API に依存している:

- `vm`（スクリプト実行サンドボックス）
- `fs`（ローカルリソース読込）
- 内部的な CommonJS `require()` 呼び出し
- `undici` / `tough-cookie` / `saxes` 等、Node 環境前提の依存関係（jsdom 自身の `dependencies` は 21 パッケージ、unpacked サイズ 約 7 MB）

Cloudflare Workers は V8 isolate 上の純 ESM 実行環境で、Node.js の `vm` や `fs` を提供しない。`nodejs_compat` 互換フラグを有効にしても jsdom 内部の dynamic `require()` 呼び出しは解決できず、ビルド後バンドルが ESM スコープで評価される段階で `require is not defined in ES module scope` が発生する。

これは Issue #2 に記載されたエラーメッセージと一致する。

参考: [jsdom/jsdom#2427 "Using inside a worker"](https://github.com/jsdom/jsdom/issues/2427)、[Cloudflare Community "JSDOM in cloudflare worker?"](https://community.cloudflare.com/t/jsdom-in-cloudflare-worker/65769)

### 3.1 本 SDK 側のアーキテクチャ上の好材料

`src/parser/html-parser.ts` の `parseBodyContent` は DOM 実装に非依存な最小インターフェースで定義されている:

```ts
type ParseableElement = {
  childNodes: NodeListOf<ChildNode>;
};
export const parseBodyContent = (body: ParseableElement): ContentNode[] => { ... }
```

内部ヘルパーの `isDomElement` / `isDomTextNode` も `Node.ELEMENT_NODE` 等のグローバル定数ではなく `nodeType === 1 / 3` の数値比較で実装されており、ブラウザ / Node.js / Workers すべてで動作する。

使用している DOM API は以下に限定される（`src/parser/html-parser.ts` 全体で 74 箇所、`src/parser/server-html-parser.ts` は 1 箇所のエントリ呼び出しのみ）:

- `childNodes`, `children`, `tagName`, `nodeType`, `textContent`
- `getAttribute`, `hasAttribute`
- `querySelector`, `querySelectorAll`（`:scope` セレクタを含む）
- `parentElement`

**すなわち DOM 実装の交換は `src/parser/server-html-parser.ts` の 1 ファイル差し替えで完結する見込み。** `parseBodyContent` と `parseElement` に手を入れる必要はない。

## 4. 代替案の比較

| 候補 | Workers 対応 | ESM | API 互換 | unpacked サイズ | 依存数 | 備考 |
|------|:------------:|:---:|:--------:|---------------:|------:|------|
| **linkedom** | ◎ 公式に `./worker` エントリ提供 | ◎ 純 ESM | ○ `DOMParser` 互換 + `parseHTML()` | 約 **920 KB** | 5 | 本命 |
| happy-dom | △ Node.js API 一部依存、Workers 実績情報が乏しい | ◎ | ◎（jsdom 相当） | 約 **8.4 MB** | — | jsdom より高速だが軽量ではない |
| parse5 + domhandler + css-select | ◎ | ◎ | × 独自 DOM 実装が必要 | 極小 | — | 工数大・`parseBodyContent` の抽象化も崩しかねない |
| Cloudflare `HTMLRewriter` | ◎（Workers 専用） | — | × streaming API、DOM 走査不可 | 0（プラットフォーム同梱） | — | Node.js で動かないため SDK の汎用性を失う |

### 4.1 linkedom の根拠

- npm: [linkedom](https://www.npmjs.com/package/linkedom) v0.18.12, ライセンス ISC
- `package.json` の `exports` に以下が含まれ、Workers 向けバンドルが公式に用意されている:
  ```json
  "./worker": { "types": "...", "import": "./worker.js" }
  ```
- 依存は `css-select` / `cssom` / `html-escaper` / `htmlparser2` / `uhyphen` の 5 パッケージのみ。いずれも pure JS で Workers 互換。
- 採用実績: [facebook/lexical#5156](https://github.com/facebook/lexical/issues/5156) 等で jsdom 代替として言及。
- 制約: MutationObserver 忠実度が低い・イベント伝播が不完全。本 SDK の用途（HTML → AST 変換の DOM 走査）には影響しない。

### 4.2 happy-dom を推奨しない理由

- パッケージサイズが jsdom とほぼ同等（8.4 MB）で、Workers バンドルサイズ制約（無料プラン 3 MB 圧縮後）に抵触するリスク。
- Node.js API 依存の除去が進んでいるもののドキュメント上 Workers 公式サポートの明記はなく、実際に入れてみないと動作保証がない。
- パフォーマンス優位（jsdom の 5–10 倍）はテスト用途での話で、SDK の SSR 用途では linkedom で十分。

## 5. 推奨方針

**linkedom に置き換える。**

ピア依存関係の名前が変わるため、破壊的変更扱い（後述 §7）。差し替えは `server-html-parser.ts` 1 ファイルで完結する。

### 5.1 想定コード差分

#### `src/parser/server-html-parser.ts`

```ts
// 変更前
import { JSDOM } from 'jsdom';
import { type ContentNode } from './nodes';
import { parseBodyContent } from './html-parser';

export const parseHtmlOnServer = (html: string): ContentNode[] => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return parseBodyContent(dom.window.document.body);
};

// 変更後
import { parseHTML } from 'linkedom';
import { type ContentNode } from './nodes';
import { parseBodyContent } from './html-parser';

export const parseHtmlOnServer = (html: string): ContentNode[] => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return parseBodyContent(document.body);
};
```

Cloudflare Workers 用バンドルを消費者が直接使う場合は `linkedom/worker` サブパスを使うよう README で案内する。ライブラリ側では `linkedom` のルートエントリを参照しつつ、消費者のバンドラ（webpack / rollup / vite / Next.js など）が `"workerd"` / `"worker"` 条件を優先することで自動的に worker バンドルが選択される構造が望ましい。

#### `package.json`

```diff
   "peerDependencies": {
     "react": "^18.0.0 || ^19.0.0",
     "react-dom": "^18.0.0 || ^19.0.0",
-    "jsdom": "^26.0.0"
+    "linkedom": "^0.18.0"
   },
   "peerDependenciesMeta": {
-    "jsdom": {
+    "linkedom": {
       "optional": true
     }
   },
   "devDependencies": {
     ...
-    "@types/jsdom": "^21.1.7",
     ...
-    "jsdom": "^26.1.0",
+    "linkedom": "^0.18.12",
     ...
   }
```

`linkedom` は型定義を同梱しているため `@types/jsdom` に相当する別パッケージは不要。

#### `vite.config.ts`

```diff
   rollupOptions: {
-    external: ['react', 'react-dom', 'react/jsx-runtime', 'jsdom'],
+    external: ['react', 'react-dom', 'react/jsx-runtime', 'linkedom'],
   },
```

#### `README.md`

「サーバーサイド（Node.js）」節を「サーバーサイド（Node.js / Cloudflare Workers / Deno）」に改題し、`linkedom` のインストール案内と、Cloudflare Workers の場合は `linkedom/worker` が自動選択される旨を追記する。

### 5.2 テスト

- `src/parser/server-html-parser.test.ts` の全ケースが linkedom でも同じ出力を生成することを確認（`parseBodyContent` が DOM 実装非依存のため、基本通るはず）。
- CI に Cloudflare Workers 環境のスモークテスト（例: `wrangler dev` + Miniflare でのインポート確認）を追加するかは別議論。最低限、`vitest` の既存テストが通れば初回リリースとしては十分。

## 6. 移行ステップ（実装タスク向けガイド）

1. 新ブランチ `fix/issue-2-linkedom-migration` を main から作成
2. `pnpm add -D linkedom@^0.18.12` / `pnpm remove jsdom @types/jsdom`
3. `package.json` の `peerDependencies` を `jsdom` → `linkedom` に差し替え、`peerDependenciesMeta` も更新
4. `src/parser/server-html-parser.ts` を §5.1 の内容に書き換え
5. `vite.config.ts` の external 配列を更新
6. `pnpm test` で既存テストがパスすることを確認
7. `pnpm build` で dist を再生成し、`dist/server.js` に `jsdom` への参照が残らないことを確認
8. README の「サーバーサイド」節を更新し、Cloudflare Workers / Deno / Bun でも動く旨を明記
9. Miniflare または簡易な Workers プロジェクトを使った最小再現スクリプトで SSR が成功することを手動確認（任意、強く推奨）
10. PR を作成し、Issue #2 を `Closes #2` で紐付け

## 7. 破壊的変更とリリース計画

### 破壊的変更

- ピア依存関係が `jsdom` から `linkedom` に変わる。すでに `@becraft/sdk/server` を使用しており `jsdom` をプロジェクトに入れていた消費者は、`linkedom` をインストールし直す必要がある。
- `parseHtmlOnServer` の **シグネチャ・入出力は不変**。呼び出しコードの書き換えは不要。

### バージョニング

現行 `0.1.2`（0.x 系）なので SemVer 厳密には minor でも破壊的変更可能だが、ユーザー影響を明示するため **0.2.0 として minor bump + CHANGELOG に BREAKING 記載** を推奨。

### リリースノート案（抜粋）

```markdown
## 0.2.0

### ⚠ BREAKING CHANGES

- `@becraft/sdk/server` のピア依存関係を `jsdom` から `linkedom` に変更しました。
  SSR 利用時は `linkedom` をインストールしてください。

  ```bash
  npm install linkedom       # 追加
  npm uninstall jsdom        # 不要になりました
  ```

  `parseHtmlOnServer` の API は変わりません。

### Features

- Cloudflare Workers / Deno / Bun での SSR に対応しました (#2)
```

## 8. 未解決事項 / フォローアップ候補

- Cloudflare Workers 実環境での E2E 動作確認は本レポートに含まれない。実装 PR では Miniflare か `wrangler dev` で最低 1 ケース動かすことを推奨。
- 将来、消費者が自前の DOM 実装（`HTMLRewriter` など）を渡せるようにする拡張ポイントを設ける余地はあるが、現段階では不要。YAGNI で見送る。
- `happy-dom` を使いたい利用者のため、`parseHtmlOnServer` のシグネチャを `(html: string, parser?: (html: string) => Document) => ContentNode[]` のように拡張する案は、需要が顕在化してから検討。

## 参考リンク

- [jsdom/jsdom #2427 – Using inside a worker](https://github.com/jsdom/jsdom/issues/2427)
- [Cloudflare Community – JSDOM in cloudflare worker?](https://community.cloudflare.com/t/jsdom-in-cloudflare-worker/65769)
- [Cloudflare Community – DOMParser in Worker](https://community.cloudflare.com/t/domparser-in-worker/169917)
- [LinkeDOM: A JSDOM Alternative (Andrea Giammarchi)](https://webreflection.medium.com/linkedom-a-jsdom-alternative-53dd8f699311)
- [facebook/lexical #5156 – Support for LinkeDOM a JSDOM Alternative](https://github.com/facebook/lexical/issues/5156)
- [How To Use HTMLRewriter for Web Scraping](https://qwtel.com/posts/software/how-to-use-htmlrewriter-for-web-scraping/)
