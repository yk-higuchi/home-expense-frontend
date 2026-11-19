# 部品の対応（Figma とコード）

Figma「家計簿」（`k99TXVIrWbQ9YYSNBnbaFW`）の「コンポーネント」ページの部品と、コードの部品の対応を Git で持ち、
`pnpm --filter @home-expense/ui lint:components`（`pnpm lint`・CI でも動く）で照合する。
考え方はデザイントークン（`design-tokens/README.md`）と同じで、正は Figma。

Figma の Code Connect は Organization 以上のプランの機能で、今のプラン（Professional）では使えないため、この形にしている。

## ファイル

| ファイル                | 中身                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `figma-components.json` | Figma から書き出した部品の一覧（名前・ID・説明・プロパティ・バリアントの値と ID・枠の ID）。手で直さない |
| `component-map.json`    | 対応表。`figma` に Figma の部品ごとの対応、`codeOnly` に Figma の部品がないコードの部品と理由            |

`component-map.json` の `figma` の各項目:

- `code`: 対応する `packages/ui` の公開名（`src/index.ts` から export しているもの）。複数でもよい
- `source`: アプリ側のファイル（リポジトリの根からの道筋）。`code` と両方でもよい
- `variants`: Figma のバリアントのプロパティごとに、すべての値をコードの表し方（props・属性・疑似クラスなど）に対応させる
- `note`: 補足（任意）

## 照合すること（`scripts/check-components.mjs`）

- Figma の部品がすべて対応表にあり、対応表の部品がすべて Figma にある
- `code` の名前が `packages/ui` から公開されていて、`source` のファイルがある
- バリアントのプロパティと値が、Figma と対応表で過不足なく一致する
- `packages/ui` が公開する部品（大文字で始まる名前と `use…`）が、どれかの Figma の部品に対応しているか、`codeOnly` に理由つきである。`codeOnly` の名前は公開されていて、Figma の部品には対応していない
- Storybook の見本の Figma のリンク（`node-id`）が、書き出した部品・バリアント・枠のどれかを指している
- Figma の部品の説明にある「コード: 名前」「コード: ファイル」が、コードにある

見た目（形・大きさ・色の当て方）は照合しない。色・余白・文字は `lint:tokens` で照合し、形は Figma と Storybook を見比べる。

## Figma を変えたとき

1. `scripts/export-figma-components.js` の中身の後ろに `return await exportFigmaComponents();` を付けて、
   Figma で実行する（Figma の MCP の use_figma など）。
2. 返ってきた JSON を `design-components/figma-components.json` に保存する（2 字下げに整える）。
3. `pnpm --filter @home-expense/ui lint:components` を実行し、ずれを `component-map.json` かコードで直す。

コードの部品を足したときも `lint:components` が知らせるので、Figma に部品を作るか、`codeOnly` に理由を書く。
