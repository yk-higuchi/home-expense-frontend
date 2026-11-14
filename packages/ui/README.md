# @home-expense/ui

家計簿アプリの UI 部品ライブラリです。Next.js から独立していて、Storybook で部品ごとに確認できます。

- デザイン: Figma「経費管理システム」（コンポーネントページ）
- トークン: `src/tokens.css`（Figma の変数と同じ値）

## コマンド

```sh
pnpm storybook        # Storybook を起動（http://localhost:6006）
pnpm build-storybook  # 静的ビルド
pnpm lint             # Biome（lint・整形）/ Stylelint / 型チェック
pnpm fix              # Biome と Stylelint の自動修正
```

## ルール

- `next/*`（`next/link`・`next/image`・`next/navigation` など）を使わない。リンクが必要な部品は、リンク部品を props で受け取る。
- データ取得やサーバー処理（server actions）を持たせない。見た目とイベントの受け渡しだけにする。
- スタイルは CSS Modules と `tokens.css` の CSS 変数で書く。値を直接書かない。
- 状態を持つ部品には `"use client"` を付ける。
- React 19 以上が前提。`ref` は props として受け取り、そのまま要素に渡す（`forwardRef` は使わない）。
- 部品ごとに `*.stories.tsx` を書き、`parameters.design` に対応する Figma のノードの URL を入れる。
