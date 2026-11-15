# home-expense-frontend（アプリ）

家計の収入と支出を管理する画面（Next.js）。画面の部品は `packages/ui`（`@home-expense/ui`）にある。

## 開発

```sh
BACKEND_URL=http://localhost:8080 pnpm dev   # http://localhost:3000
pnpm lint                                     # Biome・Stylelint・型チェック
```

API はサーバー側（Server Components・Server Actions）からだけ呼び出す。`BACKEND_URL` はブラウザには渡らない。

## API のスキーマ（JTD）

API のリクエスト・レスポンスの JTD スキーマは、バックエンドが OpenAPI から生成した `openapi.jtd.json` を取り込んだもの（`src/lib/api/generated/jtd.ts`）を使う。手で書かない。

- 使うバックエンドの版は `api-version` に書く。
- `pnpm gen:api` で取得して `jtd.ts` を作り直し、コミットする。`jtd.ts` は手で編集しない。
- JSON をそのまま import すると文字列が `string` に広がり、`JTDDataType` で正しい型にならないため、`as const` 付きの TS に変換している。
- 収支の API の金額は int64（最大 1 兆）。JTD に int64 がないため `float64` になっている（この範囲なら誤差は出ない）。
- バックエンドの Release（v2.1.0〜）ができるまでは、手元のバックエンドのファイルから作る。

  ```sh
  API_JTD_SOURCE=../../home-expense-backend/docs/openapi.jtd.json pnpm gen:api
  ```

- CI で「`pnpm gen:api` の結果がコミット済みのファイルと同じか」を確かめる検査は、Release から取得できるようになってから入れる。

## 実装の決まりごと

### 更新・削除（楽観的ロック）

- 更新は、取得したときの ETag を `If-Match` に送る（フォームの hidden 項目 `version`）。
- 削除は、一覧に表示していた行の `version` を `If-Match` に送る。削除の直前に取得し直すと、利用者が見ていない変更まで消してしまうため。
- `version` がないときは送らずに、競合（読み込み直しの案内）として扱う。
- 412・428 は「画面を読み込み直してから、もう一度…してください」と表示する。削除の 404（すでに削除されている）は、成功と同じく一覧を取得し直す。
- 削除は楽観的に表から消す（`lib/hooks/use-optimistic-delete.ts`）。削除ダイアログの開閉も `useOptimistic` で扱う。送信処理（transition）の中で変えた普通の state は、処理が終わるまで反映されないため。

### フォーム

- 失敗したときは入力値を返して入力欄に戻す。React 19 は送信後にフォームを空に戻すため。
- 日付は、実在する日付だけを受け付ける。JS の `Date` は 2026-02-30 を 3 月 2 日に繰り上げるため、年月日が変わらないことも確かめる（バックエンドと同じ判定）。
- 経費属性の分類は、登録後に変更できない。更新では属性名だけを送る。

### 一覧

- 絞り込みの条件は URL のクエリに持つ。経費の分類で「すべて」に戻したときも状態を更新する。更新しないと、次の絞り込みで古い分類が復活する。

### 設定（`next.config.mjs`・`layout.tsx`）

- `output: "standalone"`: コンテナのイメージを小さくするため。
- `transpilePackages`: 部品ライブラリ（`packages/ui`）を TypeScript のまま取り込むため。
- `outputFileTracingRoot`: モノレポのルートを基準に standalone の出力を作るため。
- `reactCompiler`: 再レンダーの最適化を React Compiler に任せる（`useCallback`・`useMemo` を手で書かない）。
- フォントは next/font で取得して自前で配信する（Google のサーバーには取りに行かない）。CSS 変数 `--font-noto-sans-jp` を `<html>` に定義し、`tokens.css` の `--font-family-base` から使う。

## コンテナのイメージと CI

- イメージのビルドの文脈は、リポジトリのルート（pnpm のワークスペース全体）にする。

  ```sh
  container build -f app/Dockerfile .   # Docker の場合は docker build -f app/Dockerfile .
  ```

- `outputFileTracingRoot` をワークスペースのルートにしているため、standalone の出力の中では `app/server.js` に置かれる。
- CI・CD では、ビルドの文脈をルートにする必要があるため、共通のワークフローを使わずにワークフローの中でイメージをビルドする（イメージ名は従来どおり `-app`）。lint もワークフローの中で動かし、ルートの `pnpm lint` で `app` と `packages/ui` の両方を対象にする。
- Node は LTS の 26 を使う（イメージ・CI とも）。手元の開発も Node 26 にそろえる。
- pnpm はルートの `package.json` の `packageManager`（12.21.0）で固定する。CI の `pnpm/action-setup` もこの版を使う。
- pnpm 12 は、公開から間もない版を入れない（`minimumReleaseAge`）。インストール時のスクリプトは `pnpm-workspace.yaml` の `allowBuilds` に書いたもの（esbuild）だけ実行する。
- 依存・イメージ・アクションの版は手で固定し、手で更新する（Renovate は使わない）。distroless のイメージは動くタグしかないため、ダイジェストで固定する。
- イメージは、ビルドに `node:<版>-trixie-slim`、実行に distroless の `nodejs26-debian13:nonroot` を使う。実行時は `HOSTNAME=0.0.0.0` で、すべてのアドレスで待ち受ける。
