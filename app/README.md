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

- 取得するバックエンドの定義は `api-version` に書く。コミットのハッシュ（40 文字）なら、そのコミットの `docs/openapi.jtd.json` を GitHub から取得する。版（例：`2.1.0`）なら、その版の GitHub Release から取得する（`gh` が必要）。バックエンドの v2.1.0 がリリースされるまでは、コミットを固定する。
- `pnpm gen:api` で取得して `jtd.ts` を作り直し、コミットする。`jtd.ts` は手で編集しない。
- 手元のバックエンドのファイルから作るときは、`API_JTD_SOURCE` を指定する。

  ```sh
  API_JTD_SOURCE=../../home-expense-backend/docs/openapi.jtd.json pnpm gen:api
  ```

- JSON をそのまま import すると文字列が `string` に広がり、`JTDDataType` で正しい型にならないため、`as const` 付きの TS に変換している。
- 生成したスキーマは未知の項目を許す（`additionalProperties: true`）ため、なくなった項目を読んでもエラーにならない。バックエンドの項目が減ったときは、使っている箇所を検索して直す。
- 収支の API の金額は int64（最大 1 兆）。JTD に int64 がないため `float64` になっている（この範囲なら誤差は出ない）。
- CI で、`pnpm gen:api` の結果がコミット済みのファイルと同じかを確かめる。

## 実装の決まりごと

### 更新・削除（楽観的ロック）

- ETag は、リソースの中身（PUT の本文と同じ項目）から計算した値（バックエンドの README を参照）。中身が同じなら値も同じ。
- 更新は、取得したときの ETag を `If-Match` に送る（フォームの hidden 項目 `version`）。
- 削除は、確認のダイアログを開いたときに個別取得し、取得した内容をダイアログに表示して、その ETag を `If-Match` に送る。利用者が見た内容と、消す内容を一致させるため（一覧には ETag がない）。読み込みが終わるまで、削除のボタンは押せない。
- ETag がないときは送らずに、競合（読み込み直しの案内）として扱う。
- 412・428 は「画面を読み込み直してから、もう一度…してください」と表示する。削除の 404（すでに削除されている）は、成功と同じく一覧を取得し直す。
- 削除は楽観的に表から消す（`lib/hooks/use-optimistic-delete.ts`）。削除ダイアログの開閉も `useOptimistic` で扱う。送信処理（transition）の中で変えた普通の state は、処理が終わるまで反映されないため。

### フォーム

- 失敗したときは入力値を返して入力欄に戻す。React 19 は送信後にフォームを空に戻すため。
- 日付は、実在する日付だけを受け付ける。JS の `Date` は 2026-02-30 を 3 月 2 日に繰り上げるため、年月日が変わらないことも確かめる（バックエンドと同じ判定）。
- 支出属性の分類は、登録後に変更できない。更新では属性名だけを送る。

### 属性の並べ替え

- 支出属性（分類ごと）と収入属性は、一覧でドラッグして並べ替える（`@home-expense/ui` の `useSortableList`）。属性の一覧はページ送りがなく、全件を並び順で表示する。登録できるのは、それぞれ 100 件まで。
- 一覧の取得で受け取った ETag（一覧の本文のダイジェスト）を持ち、ドラッグを離すたびに、一覧への `PATCH`（JSON Patch の `move` を 1 つ、`application/json-patch+json`）を `If-Match` 付きで送る。
- 表示は楽観的に先に並べ替える（`lib/hooks/use-optimistic-reorder.ts`）。成功したら、返ってきた ETag に置き換える。409（範囲外の位置）・412・422・428 は表示を元に戻し、読み込み直しを案内する。
- 保存の途中は次の並べ替えを止める。古い ETag で送ると 412 になるため。
- プルダウンと HOME の内訳は、API が返す並び順のまま表示する。

### 保存・削除のあとの一覧

- 一覧から編集画面に移るときは、今の絞り込みとページを `from` として渡す。保存したあとは、編集した明細がその条件（年・月・分類・属性名）に当てはまれば同じページに戻り、当てはまらなければ新しい日付の年月の一覧に移る。移動先の URL はアプリ側で組み立てる（`lib/list-return.ts`）。
- 登録したあとは、登録した明細の年月（収入は年）の一覧に移る。新しい明細の ID は、登録の API の `Location` ヘッダーから取る。
- 移動先には `saved=<ID>` を付ける。一覧はその行を強調してスクロールし、「『…』を保存しました」をトースト（`@home-expense/ui` の `Toast`）で表示する。表示したあとは URL から `saved` を消す（再読み込みでまた出ないように）。
- 削除したら「『…』を削除しました」をトーストで表示する。
- トーストは右下に出て 5 秒で消える。マウスを乗せている間とフォーカスがある間は止め、閉じるボタンでも消せる。
- 一覧での削除・並べ替えの失敗も、赤のトーストで出す（表の上には出さない）。エラーは読み終える前に消えると困るため、自動では消さず、閉じるボタンか次の操作で消す。フォームの入力エラーと、削除確認ダイアログの中のエラーは、今までどおりその場に出す。
- 一覧のトーストは `@home-expense/ui` の `useToast` で 1 つにまとめる。削除・並べ替えのフックは、結果をこれに渡す（`success` / `error` / `clear`）。最後のページの最後の 1 件を消して空になったら、1 つ前のページに移る。

### 一覧

- 絞り込みの条件は URL のクエリに持つ。支出の分類で「すべて」に戻したときも状態を更新する。更新しないと、次の絞り込みで古い分類が復活する。

### 設定（`next.config.mjs`・`layout.tsx`）

- `output: "standalone"`: コンテナのイメージを小さくするため。
- `transpilePackages`: 部品ライブラリ（`packages/ui`）を TypeScript のまま取り込むため。
- `outputFileTracingRoot`: モノレポのルートを基準に standalone の出力を作るため。
- `reactCompiler`: 再レンダーの最適化を React Compiler に任せる（`useCallback`・`useMemo` を手で書かない）。
- フォントは next/font で取得して自前で配信する（Google のサーバーには取りに行かない）。CSS 変数 `--font-noto-sans-jp` を `<html>` に定義し、`tokens.css` の `--font-family-base` から使う。

## 画面の幅

- 画面全体（サイドバーとメイン）の幅は最大 1440px で、それより広い画面では中央に置く（左右は背景色）。Figma の画面の幅（1440px）と同じで、広い画面でも表や合計の行が間延びしない。
- 1440px より狭い画面では、メインが残りの幅に合わせて縮む。

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

## HOME・年間レポート

- HOME（`ui/expense-aggregate.tsx`）・年間レポート（`ui/annual-report.tsx`）とグラフ（`ui/parts/balance-chart.tsx`）はサーバーコンポーネント。年（HOME は年と月）のプルダウンと、移動中に内容を薄くする表示だけを `ui/parts/period-filter-frame.tsx`（クライアントコンポーネント）に分け、サーバーで描いた内容を `children` で受け取る。

## サーバーコンポーネントとクライアントコンポーネントの分け方

- 画面（`ui/*.tsx`）はサーバーコンポーネントにし、操作が要る部分だけをクライアントコンポーネントにする。
  - 一覧：絞り込み（`ui/parts/expense-filters.tsx`・`year-filter.tsx`・`category-filter.tsx`）と表（`ui/parts/*-table.tsx`。削除・並べ替え・強調・トースト）。
  - 「追加」は `ButtonLink`、ページ送りはリンク（`ui/parts/pagination-component.tsx`）で、サーバーで描く。
- 一覧は `ui/parts/list-frame.tsx`（クライアント）で包む。中の絞り込みと表に、画面を移動中かどうか（表を薄くする）と移動の関数を context で渡す。`data-list-link` の付いたリンク（ページ送り）のクリックは、ここで受け取り、移動中の表示を出しながら移動する。修飾キー付きのクリック（新しいタブなど）はブラウザに任せる。
  - `data-list-link` の印は `lib/list-link.ts` に置く。`"use client"` のファイルから値を書き出すと、サーバー側では値ではなく参照になるため。
- 表の「編集」は、表の中で移動する（支出・収入は、今の絞り込みとページを `from` に入れる）。
- 削除で最後のページが空になったときの前のページへの移動は、表の中で行う（`lib/hooks/use-empty-page-fallback.ts`）。サーバーの `redirect` にすると、削除の結果を受け取る前に画面が移り、「削除しました」のトーストが出ない。
- 読み込み中の表示（`app/loading.tsx`）の都合で、内容は JavaScript で差し込まれる。JavaScript を切ったブラウザでは画面が表示されない（リンクにしたことで JavaScript なしで動くわけではない）。
