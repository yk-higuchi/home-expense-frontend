# デザイントークン（Figma との対応）

色・余白・文字の定義は Figma「経費管理システム」（`k99TXVIrWbQ9YYSNBnbaFW`）が正で、
`src/tokens.css` はそれと同じ名前・同じ値で持つ。

| 種類           | Figma                                                              | tokens.css                                        |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| 色（基礎）     | 「基礎カラー」コレクション（水色/100 など。直接は使わない）        | 持たない                                          |
| 色（役割）     | 「補助カラー」コレクション（基本/文字 など。値は基礎カラーを参照） | `--color-*`（変数のコード名 WEB と同じ名前）      |
| 余白・角丸・線 | SDS の Space / Radius / Stroke                                     | `--sds-size-*`（SDS のコード名と同じ）            |
| 文字           | 文字スタイル SDS/*（5 種類）                                       | `--text-*`（対応表は `scripts/check-tokens.mjs`） |
| 影             | SDS の Drop Shadow/200                                             | `--sds-effect-shadow-200`                         |

## Figma を変えたとき

1. `scripts/export-figma-tokens.js` の中身の後ろに `return await exportFigmaTokens();` を付けて、
   Figma で実行する（Figma の MCP の use_figma など）。
2. 返ってきた JSON を `design-tokens/figma-tokens.json` に保存する。
3. `pnpm --filter @home-expense/ui lint:tokens` で照合し、ずれた `src/tokens.css` を直す。

`lint:tokens` は `pnpm lint`（CI）でも動き、ずれがあると失敗する。

## 決まりごと

- 色を足すときは、Figma の補助カラーに変数を作り（値は基礎カラーを参照、コード名 WEB に `var(--color-…)`）、
  tokens.css にも同じ名前で足す。
- 余白・角丸は SDS の段階だけを使う。段階の外の値（13px など）は使わない。
- 文字スタイルは SDS/* の 5 種類だけを使う。増やすときは `check-tokens.mjs` の対応表にも足す。
