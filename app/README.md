# home-expense-frontend（アプリ）

家計の収入と支出を管理する画面（Next.js）。画面の部品は `packages/ui`（`@home-expense/ui`）にある。

## 開発

```sh
BACKEND_URL=http://localhost:8080 pnpm dev   # http://localhost:3000
pnpm lint                                     # Biome・Stylelint・型チェック
```

API はサーバー側（Server Components・Server Actions）からだけ呼び出す。`BACKEND_URL` はブラウザには渡らない。

`BACKEND_URL` は `app/.env` に書いてもよい。`.env` は git の管理外にしてあるので、`cp .env.example .env` で作って値を変える。

## 層の構成

`src/` は次の 5 つの層に分ける。依存は上から下への 1 方向だけにする。逆向きの import は、Biome の `noRestrictedImports`（`biome.jsonc` の `overrides`）で lint のエラーにする。

| 層                | 受け持つこと                                                                                                                                                                      | 依存してよい層                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `app/`            | ルーティング（`page`・`not-found`・`error`）。データを取得して画面に渡す                                                                                                          | `ui`・`server`・`core`・`network` |
| `ui/`             | 画面と部品（サーバー・クライアント）。`ui/hooks/` はクライアントのフック                                                                                                          | `server`・`core`                  |
| `server/queries/` | 読み取り。`import "server-only"` を付け、サーバーコンポーネントからだけ使う                                                                                                       | `core`・`network`                 |
| `server/actions/` | 変更（Server Actions、`"use server"`）。入力チェック、失敗の文言、キャッシュの更新、画面の移動                                                                                    | `core`・`network`                 |
| `core/`           | 業務の型と決まり（明細の型、入力チェック、画面の文言、削除対象の表示）。通信・画面・Next.js・React に依存しない                                                                   | なし                              |
| `network/`        | バックエンドとの通信（`http/`）と、その中身の検査（`schema/`）、生成物（`generated/`）、Link ヘッダー（`pagination/`）、API ごとの呼び出し（`api/`）。Next.js・React に依存しない | なし                              |

- 読み取りを `"use server"` のファイルに置かない。Next.js の資料では、Server Functions は変更のためのもので、取得はサーバーコンポーネントから行う（Server Actions は順番に処理されるため、取得に使うと直列になる）。読み取りは、`server-only` を付けたデータアクセスの層（`server/queries/`）に置く。
- `core` は「業務の型と決まり」に限る。通信のエラー（`HttpError`）を文言にする処理は、`server/actions/failure.ts` に置く。
- `ui` は `network` に依存しない。通信の結果は `server` が `core` の型に変えて渡す（例：Link ヘッダーを読んだ `network` の `PageLinks` を、`server/queries/pagination.ts` で `core` の `Pagination` に変える）。

## API のスキーマ（JSON Schema）

API のリクエスト・レスポンスは、バックエンドが OpenAPI から生成した JSON Schema 2020-12（`openapi.schema.json`）で検査する。手で書かない。

- 取得するバックエンドの定義は `api-version` に書く。コミットのハッシュ（40 文字）なら、そのコミットの `docs/openapi.schema.json` を GitHub から取得する。版（例：`2.1.0`）なら、その版の GitHub Release から取得する（`gh` が必要。CI では `GH_TOKEN` に `github.token` を渡す）。今は v2.1.1 を使う。
- `pnpm gen:api` で取得して、次の 2 つを作り直し、コミットする。どちらも手で編集しない。
  - `src/network/generated/schema.ts`：スキーマそのもの（`openApiSchema`）。検査に使う。
  - `src/network/generated/types.ts`：`$defs` の各スキーマの型（`Schemas`）。同じファイルから生成するので、検査と型が食い違わない。
- 型は `openapi-typescript` を使わず、`gen-api.mjs` が作る。`openapi-typescript` は TypeScript 5 の API を使い、このプロジェクトの TypeScript 7 では動かないため。スキーマが使うキーワードは `type`・`properties`・`required`・`items`・`$ref`・`enum` などに限られる。知らない構造のキーワード（`oneOf` など）が現れたら、生成はエラーで止まる（`toType` に足す）。
- 手元のバックエンドのファイルから作るときは、`API_SCHEMA_SOURCE` を指定する。

  ```sh
  API_SCHEMA_SOURCE=../../home-expense-backend/docs/openapi.schema.json pnpm gen:api
  ```

- 検査は `network/schema/index.ts`（`Ajv2020`、`strict: true`、`allErrors: true`、`ajv-formats` の `date`・`uuid`・`uri`・`int32`・`int64`）。バックエンドの CI が記録したやり取りを照合しているのと同じ設定。スキーマはオブジェクトではなく名前（例：`"ExpenseGetResponse"`）で指定し、型は `Schema<"ExpenseGetResponse">`。
- レスポンスのスキーマは未知の項目を許すので、バックエンドが項目を増やしても検査は通る。リクエストのスキーマは定義にない項目を拒否する。
- リクエストも送る前に検査する（文字数・空白だけ・金額の範囲・日付の形式など）。フォームの入力チェックをすり抜けた値は `JSONSerializeError` になるので、入力チェックはスキーマの制約と同じか、それより厳しくする（空白だけの値は「入力してください」にする）。
- 収支の API の金額は int64（最大 1 兆）。TypeScript では `number` で、`Number.MAX_SAFE_INTEGER` より小さいので誤差は出ない。
- ajv は検査の関数を `new Function` で作る。API はサーバー側からだけ呼ぶので、ブラウザの CSP の影響は受けない。
- CI で、`pnpm gen:api` の結果がコミット済みのファイルと同じかを確かめる。

## 実装の決まりごと

### 更新・削除（楽観的ロック）

- ETag は、リソースの中身（PUT の本文と同じ項目）から計算した値（バックエンドの README を参照）。中身が同じなら値も同じ。
- 更新は、取得したときの ETag を `If-Match` に送る（フォームの hidden 項目 `version`）。
- 削除は、確認のダイアログを開いたときに個別取得し、取得した内容をダイアログに表示して、その ETag を `If-Match` に送る。利用者が見た内容と、消す内容を一致させるため（一覧には ETag がない）。読み込みが終わるまで、削除のボタンは押せない。
- 個別取得の Promise は、表の「削除」を押したときに作って state に入れ（`ui/hooks/use-optimistic-delete.ts`）、ダイアログの中で `use()` で読む（`ui/parts/delete-dialog.tsx`）。読み込み中は `Suspense` の fallback で「読み込み中…」と押せない削除のボタンを出す。`Suspense` には行の id を key に付け、別の行を開いたときに前の行の内容が残らないようにする。effect で取得して古い結果を捨てるフラグが要らない。
- ETag がないときは送らずに、競合（読み込み直しの案内）として扱う。
- 412・428 は「画面を読み込み直してから、もう一度…してください」と表示する。削除の 404（すでに削除されている）は、成功と同じく一覧を取得し直す。
- 削除は楽観的に表から消す（`ui/hooks/use-optimistic-delete.ts`）。削除ダイアログの開閉も `useOptimistic` で扱う。送信処理（transition）の中で変えた普通の state は、処理が終わるまで反映されないため。

### フォーム

- 失敗したときは入力値を返して入力欄に戻す。React 19 は送信後にフォームを空に戻すため。
- 日付は、実在する日付だけを受け付ける。JS の `Date` は 2026-02-30 を 3 月 2 日に繰り上げるため、年月日が変わらないことも確かめる（バックエンドと同じ判定）。
- 支出属性の分類は、登録後に変更できない。更新では属性名だけを送る。
- 送信して入力エラーが返ったら、最初のエラーの欄（`aria-invalid="true"`）にフォーカスを移す（`ui/hooks/use-focus-first-error.ts`）。画面を開いたときは自動でフォーカスを当てない。スマホでキーボードが出てしまうため。
- 支出・収入の登録画面は、日付の初期値を今日にする。今日はほかの画面の年月と同じくサーバーの時刻で決め、ページから渡す。
- フォームの下に「一覧に戻る」と保存のボタンを並べる（`ui/parts/form-actions.tsx`）。支出・収入は、一覧から渡された `from` の絞り込みに戻る。支出属性は分類の一覧に戻る。

### 属性の並べ替え

- 支出属性（分類ごと）と収入属性は、一覧でドラッグして並べ替える（`@home-expense/ui` の `useSortableList`）。属性の一覧はページ送りがなく、全件を並び順で表示する。登録できるのは、それぞれ 100 件まで。
- 一覧の取得で受け取った ETag（一覧の本文のダイジェスト）を持ち、ドラッグを離すたびに、一覧への `PATCH`（JSON Patch の `move` を 1 つ、`application/json-patch+json`）を `If-Match` 付きで送る。
- 表示は楽観的に先に並べ替える（`ui/hooks/use-optimistic-reorder.ts`）。成功したら、返ってきた ETag に置き換える。409（範囲外の位置）・412・422・428 は表示を元に戻し、読み込み直しを案内する。
- 保存の途中は次の並べ替えを止める。古い ETag で送ると 412 になるため。
- 保存の途中は「並び順を保存しています…」のトースト（`tone: "pending"`）を出し、成功したら消す。失敗したらそのまま赤のトーストに替わる。表の上や下に出すと、表がずれたり、長い一覧では見えなかったりするため。
- プルダウンと HOME の内訳は、API が返す並び順のまま表示する。

### 保存・削除のあとの一覧

- 一覧から編集画面・登録画面に移るときは、今の絞り込み（編集画面にはページも）を `from` として渡す。保存したあとは、編集した明細がその条件（年・月・分類・属性名）に当てはまれば同じページに戻り、当てはまらなければ新しい日付の年月の一覧に移る。移動先の URL はアプリ側で組み立てる（`server/actions/list-return.ts`）。
- 登録したあとも、同じ決まりで `from` の一覧に戻るか、登録した明細の年月（収入は年）の一覧に移る。新しい明細の ID は、登録の API の `Location` ヘッダーから取る。
- 移動先には `saved=<ID>` を付ける。一覧はその行を強調してスクロールし、「『…』を保存しました」をトースト（`@home-expense/ui` の `Toast`）で表示する。表示したあとは URL から `saved` を消す（再読み込みでまた出ないように）。
- 削除したら「『…』を削除しました」をトーストで表示する。
- トーストは右下に出て 5 秒で消える。マウスを乗せている間とフォーカスがある間は止め、閉じるボタンでも消せる。
- 一覧での削除・並べ替えの失敗も、赤のトーストで出す（表の上には出さない）。エラーは読み終える前に消えると困るため、自動では消さず、閉じるボタンか次の操作で消す。フォームの入力エラーと、削除確認ダイアログの中のエラーは、今までどおりその場に出す。
- 一覧のトーストは `@home-expense/ui` の `useToast` で 1 つにまとめる。削除・並べ替えのフックは、結果をこれに渡す（`success` / `error` / `clear`）。最後のページの最後の 1 件を消して空になったら、1 つ前のページに移る。

### 一覧

- 一覧の上の部分（`list-layout.module.css` の `.toolbar`）は、絞り込みと「追加」を左右に並べる。折り返しは逆向き（`flex-wrap: wrap-reverse`）にし、絞り込みが折り返す幅（スマホ、タブレットの支出など）では「追加」を一番上の行の右端に出す。主な操作をページを開いてすぐ見えるようにし、ほかの一覧とも位置をそろえるため。折り返さない一覧（収入・支出属性）は同じ行の右端のまま。逆向きでは縦の向きも入れ替わるので、下端をそろえる指定は `align-items: flex-start` にする。Tab で移る順は「絞り込み → 追加」のまま。
- 絞り込みの条件は URL のクエリに持つ。支出の分類で「すべて」に戻したときも状態を更新する。更新しないと、次の絞り込みで古い分類が復活する。
- 絞り込みのプルダウンの値は、URL から受け取った値を `useOptimistic` で持つ。選んだ値は画面の移動（`useNavigation` の `navigate` の第 2 引数）と同じ transition の中で入れ、移動している間だけ見せる。移動が終われば受け取った値に戻るので、ブラウザの「戻る」「進む」でも URL と表示がずれない。`useState` に写すと、同じページで検索条件だけが変わったときは部品が作り直されず、古い値が残る。
- 幅 768px 以上では、収入・支出・属性の一覧のページの高さを本文に合わせ（`list-layout.module.css` の `.page`）、表が収まらないときは表の中だけをスクロールして見出しの行を留める（`Table` の `stickyHeader`）。絞り込みとページ送りは表の外にあるので、いつも見える。行が少ないときは表を伸ばさない。幅 767px 以下では今までどおり画面全体をスクロールする。
- 年間レポートと HOME は、年月の選択を本文の上に留める（`list-layout.module.css` の `sticky`）。グラフや集計と表が縦に並び、表の中だけをスクロールさせる形が合わないため。

### 画面の枠（`dashboard-layout`）

- 幅 768〜1279px（タブレット）では、画面の外側の余白を 32px から 16px に、本文の余白（`--padding-page`）を 24px から 16px に詰める。表に使える幅を広げるため。`--padding-page` は本文（`.content`）の上で上書きするので、本文の余白を使う年月の選択の固定（`list-layout.module.css` の `sticky`）もそのまま合う。
- 表の最小幅は表ごとに、列の定義（`ui/parts/table-columns.tsx`）から計算して `--table-min-width` に渡す。幅の決まった列の合計に、説明・属性名など幅の決まっていない列を 1 列 100px（年間レポートの金額の列は 128px）として足す。操作の列とつまみの列の幅はタッチの端末で広がるので、CSS 変数（`--row-actions-width`・`--reorder-actions-width`・`--handle-width`、`table-columns.module.css`）にして、列の幅と最小幅の両方で使う。マウスでは支出 720・収入 624・支出属性 478・収入属性 382・年間レポート 448px、タッチの端末では支出 740・収入 644・支出属性 566・収入属性 470px。一律の 880px だと、iPad の横向き（1180px）でも列に余裕があるのに横スクロールが出ていた。
- 幅 767px 以下では、表を横にスクロールさせず、見せ方を変える（`table-columns.module.css`、列の定義の `mobile`）。セルには `data-mobile` で役割を付け、CSS グリッドで並べ替える。表の作り（読み上げの行・列・見出し）はそのままにし、見出しの行は見た目だけ隠す。
  - 支出・収入（`.stacked`）：1 行を 2 段にする。1 段目に説明と金額、2 段目に日付・属性名・分類を「・」でつないで小さい文字（`--text-caption-size`）で出し、右に編集・削除。No. は出さない。2 段目は 1 行で、長い属性名は「…」で切る。「・」は読み上げない（`content: "・" / ""`）。
  - 支出属性・収入属性（`.compact`）：つまみ・属性名・「…」のメニュー（`@home-expense/ui` の `ActionMenu`、`ui/parts/attribute-row-actions.tsx`）の 1 段にする。上へ移動・下へ移動・編集・削除はメニューにまとめる（4 つのボタンで 222px あり、画面に入らないため）。No. と分類（絞り込みで分かる）は出さない。幅 768px 以上では今までどおり 4 つのボタンを並べる。
  - 年間レポート（`.fit`）：金額の列の最小幅をやめて中身の幅にし、セルの左右を 4px、文字を小さくする。12 か月を縦に比べられるよう表のまま残す。
  - 表の最小幅（`--table-min-width`）は使わない。読み込み中の表とエラーの表も同じ並びにする（エラーの行は幅いっぱい）。
- 幅 768px 以上では本文（`main`）の中だけがスクロールする。ページの切り替えの層（`page-transition.module.css` の `.stack`）は、高さを `min-height: 100%` にする。`height: 100%` にすると、中身がその外にはみ出し、本文の下の余白がスクロールの最後に付かない（Chrome はスクロールの末尾に、本文の直接の子の下端で余白を足すため）。
- HOME（幅 1280px 以上）は、ページの高さを本文に合わせて内訳だけをスクロールさせるため、`height: 0; min-height: 100%` にする。中身の高さで本文が伸びないようにするため。
- 幅 767px 以下では、ナビゲーション・ヘッダー・本文を 1 列のグリッドに並べ、`align-content: start` にする。付けないと、中身が画面より短いページで余った高さが各行に配られ、ヘッダーが伸びる。
- 幅 768px 以上では、ヘッダーの「メニュー」でサイドメニューを隠せる。隠したかどうかは Cookie（`site-menu=collapsed`、1 年）に保存し、サーバーで読んで最初から隠した状態で描く（読み込んだ直後にメニューが一瞬出ないようにするため）。Cookie は Cookie Store API で書く。幅 767px 以下の開閉は今までどおりで、保存しない。

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
- イメージは、ビルドに `node:<版>-trixie-slim`、実行に distroless の `nodejs26-debian13:nonroot` を使い、どちらも digest で固定する。実行時は `HOSTNAME=0.0.0.0` で、すべてのアドレスで待ち受ける。
- 実行時の利用者は、バックエンドと同じく数字（`USER 65532:65532`、distroless の nonroot）で指定する。Kubernetes の `runAsNonRoot` は、利用者が名前だと root でないことを確かめられないため。
- イメージには OCI のラベル（`org.opencontainers.image.*`）で、名前・ソース・ライセンス・版（`app/package.json` の `version`）・コミットを入れる。CI の `image` が `VERSION` と `GIT_SHA` を渡す。
- CI の `image` は、ビルドの前に hadolint で `app/Dockerfile` を検査する。

## lint

ワークフローは 2 つに分ける。アプリの検査は CI（`ci.yaml`）、アプリ以外の検査は Lint（`lint.yaml`）で動かす。バックエンドと同じ分け方。

| 対象                       | ツール                                                           | 設定                                      | 動かす場所      |
| -------------------------- | ---------------------------------------------------------------- | ----------------------------------------- | --------------- |
| TypeScript・CSS・JSON      | Biome・Stylelint・TypeScript・knip・`lint:tokens`（`pnpm lint`） | `biome.json`・`stylelint.config.mjs` など | CI（`lint`）    |
| `app/Dockerfile`           | hadolint                                                         | 既定の規則                                | CI（`image`）   |
| `.github/workflows/*.yaml` | actionlint                                                       | 既定の規則                                | Lint            |
| YAML                       | yamllint                                                         | `.yamllint`                               | Lint            |
| Markdown                   | markdownlint-cli2                                                | `.markdownlint-cli2.yaml`                 | Lint            |
| コミットメッセージ         | commitlint                                                       | `.commitlintrc.json`                      | Lint（PR のみ） |

- yamllint は生成物（`node_modules/`、`pnpm-lock.yaml` など）を対象外にし、行の長さは検査しない。markdownlint も行の長さは検査しない。いずれも日本語の説明や URL が長くなるため。markdownlint は、release-please が書く `CHANGELOG.md` と、`next dev` が作る `app/AGENTS.md` も対象外にする。
- シェルスクリプト・Python・SQL のファイルはないので、バックエンドにある ShellCheck・ruff・sqlfluff は入れていない。
- 手元で yamllint を使うときは、`pip install -r requirements.txt` で CI と同じ版を入れる。Python の版は、手元は `.python-version`（3.14.0）、CI は 3.14 系の最新を使う（GitHub の実行環境に、パッチの版まで指定した Python がないことがあるため。バックエンドと同じ）。Markdown は `pnpm markdownlint-cli2` で検査する。

### 手元での検査（lefthook）

`lefthook.yaml` で、コミットの前に CI・Lint と同じ検査を、変更したファイルだけに行う。バックエンドと同じ仕組み。

- コミットの前（pre-commit）：Biome（`app` と `packages/ui` それぞれの設定で）、Stylelint、markdownlint、yamllint、actionlint、hadolint。自動で直せるもの（Biome、Stylelint）は、直した結果をコミットに含める。
- コミットメッセージ（commit-msg）：commitlint
- 型チェック・knip・`lint:tokens` はプロジェクト全体を見るので、フックには入れず CI に任せる。

使う前に、ツールを入れてフックを登録する。

```sh
pnpm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
brew install lefthook actionlint hadolint
lefthook install
```

yamllint は `.venv/bin` にあるので、コミットするときは `.venv` を有効にしておくか、`.venv/bin` を `PATH` に入れる。lefthook 自体は npm のパッケージとしては入れず、CLI（Homebrew など）で入れる前提にしている。

## CI の依存の固定

- GitHub Actions の `uses:` は、すべてコミットのハッシュで固定し、行末に版をコメントで書く（例：`actions/checkout@<40 文字のハッシュ> # v7.0.1`）。タグは付け替えられるため、版の指定だけにはしない。
- CI でダウンロードするツール（actionlint、hadolint）は、版と SHA-256 を `env` に書き、ダウンロードしたファイルを `sha256sum -c` で検証してから使う。
- Python のツール（yamllint）は `requirements.txt`、Node のツール（markdownlint-cli2、commitlint など）は `package.json` と `pnpm-lock.yaml` で版を固定する。
- 版を上げるときは、ハッシュ（またはチェックサム）と版のコメントを必ず一緒に変える。

## リリース（release-please）

バックエンドと同じ仕組みでリリースする。

- コミットは Conventional Commits で書く（例：`feat: …`・`fix(ui): …`）。pull request では、Lint（`lint.yaml`）の commitlint（`@commitlint/config-conventional`、`.commitlintrc.json`）で検査する。

1. **プルリクエスト**：CI（`ci.yaml`）が lint・`test`（Storybook の見本のアクセシビリティの検査）・`image`（hadolint、イメージのビルドと Trivy の検査）を行う。イメージはまだ push しない。Lint（`lint.yaml`）がアプリ以外の検査とコミットの検査を行う。
2. **`main` への push**：
   - CI が同じ検査を行い、テスト済みのイメージを `ghcr.io/<リポジトリ>-app:sha-<コミット>` として push する。
   - 同時に Release（`release.yaml`）が release-please を動かし、リリースの PR を作るか更新する。版の番号は Conventional Commits から決まる。
   - リリースの PR を作った・更新したときは、Release がそのブランチで CI と Lint を起動する（下の「`GITHUB_TOKEN` の制約」）。
3. **リリースの PR のマージ**：Release がタグ（`v1.1.0` の形）と GitHub のリリースを作り、同じ実行の中で CD（`cd.yaml`）を呼ぶ。CD は次を行う。
   - タグのコミットで、`main` への push の CI が成功するのを待つ（失敗したら止まる）。
   - テスト済みの `sha-<コミット>` のイメージを、作り直さずに digest で指定して版のタグと `latest` に付け替える。
   - 付けたタグは、テスト済みのイメージを 1 つだけ含む index になるので、タグの digest は元と変わる。元のイメージの digest は、CD の実行結果のまとめ（Step Summary）に書く。本番で digest を指定するときは、この値を使う。

- 設定は `release-please-config.json`、今の版は `.release-please-manifest.json`。版の番号は `app/package.json` の `version` も一緒に書き換える。変更履歴は `CHANGELOG.md` に書かれる。`packages/ui` は外に公開しないので、版は上げない。
- `CHANGELOG.md` と `.release-please-manifest.json` は release-please が書くので、Biome の対象から外している。
- CD は、版を指定して手動でも動かせる（`workflow_dispatch`）。元のコミットはタグ `v<版>` から調べる。GitHub の画面で手作業でリリースを作った場合は、自動では動かないので手動で動かす。

### `GITHUB_TOKEN` の制約

release-please は `GITHUB_TOKEN` で動かす。`GITHUB_TOKEN` で作った PR・タグ・リリースは、ほかのワークフローを起動しない。例外は `workflow_dispatch` と `workflow_call` なので、バックエンドと同じく次のように回避している。

- リリースの PR：Release が `gh workflow run` で、リリースの PR のブランチに対して CI と Lint を起動する。実行はリリースの PR の先頭のコミットに紐づく（実行の一覧では `workflow_dispatch` と表示される）。
- リリース：Release が `workflow_call` で CD を呼ぶ。
- リポジトリの設定で「Allow GitHub Actions to create and approve pull requests」を有効にしておく必要がある（このリポジトリでは有効）。

## HOME・年間レポート

- HOME（`ui/expense-aggregate.tsx`）・年間レポート（`ui/annual-report.tsx`）とグラフ（`ui/parts/balance-chart.tsx`）はサーバーコンポーネント。年（HOME は年と月）のプルダウンと、移動中に内容を薄くする表示だけを `ui/parts/period-filter-frame.tsx`（クライアントコンポーネント）に分け、サーバーで描いた内容を `children` で受け取る。

## サーバーコンポーネントとクライアントコンポーネントの分け方

- 画面（`ui/*.tsx`）はサーバーコンポーネントにし、操作が要る部分だけをクライアントコンポーネントにする。
  - 一覧：絞り込み（`ui/parts/expense-filters.tsx`・`year-filter.tsx`・`category-filter.tsx`）と表（`ui/parts/*-table.tsx`。削除・並べ替え・強調・トースト）。
  - 「追加」は `ButtonLink`、ページ送りはリンク（`ui/parts/pagination-component.tsx`）で、サーバーで描く。
- 一覧は `ui/parts/list-frame.tsx`（クライアント）で包む。中の絞り込みと表に、画面を移動中かどうか（表を薄くする）と移動の関数を context で渡す。`data-list-link` の付いたリンク（ページ送り）のクリックは、ここで受け取り、移動中の表示を出しながら移動する。修飾キー付きのクリック（新しいタブなど）はブラウザに任せる。
  - `data-list-link` の印は `ui/parts/list-link.ts` に置く。`"use client"` のファイルから値を書き出すと、サーバー側では値ではなく参照になるため。
- 表の「編集」は、表の中で移動する（支出・収入は、今の絞り込みとページを `from` に入れる）。
- 削除で最後のページが空になったときの前のページへの移動は、表の中で行う（`ui/hooks/use-empty-page-fallback.ts`）。サーバーの `redirect` にすると、削除の結果を受け取る前に画面が移り、「削除しました」のトーストが出ない。
- `app/loading.tsx` は置かない。置くと、サーバーは先に読み込み中の画面を返し、内容をあとから JavaScript で差し込む（ストリーミング）ため、JavaScript を切ったブラウザでは内容が表示されない。置かないことで、サーバーはデータを揃えてから完成した HTML を返す。
- 代わりに、画面を移るあいだは移動先の画面の枠（スケルトン）を出す。レイアウト全体を `PageTransition`（`ui/parts/page-transition.tsx`）で包み、中の `/` で始まるリンクのクリック（サイドバー・「追加」など）を受け取って、`useTransition` の中で移動する。表の「編集」も `usePageTransition` の `navigate` で移動する。
  - 移動先の枠は `ui/skeletons.tsx` の `skeletonFor(URL)` が返す。表の見出しは `ui/parts/table-columns.tsx` の列の定義を本物の表と共有する。
  - 移動が 200ms 以内に終われば枠は出さない（CSS の `animation-delay` で、200ms たってから今の画面を隠して枠を見せる）。速い移動でちらつかないため。枠は静止させる（明滅しない）。
  - 移動中はサイドバーの選択も移動先に合わせる。
  - ページ送り（`data-list-link`）は対象外。一覧の中の移動なので、`ListFrame` が表を薄くする。
  - 修飾キー付きのクリック・`target` のあるリンク・`download` のリンクは、ブラウザに任せる（新しいタブで開く）。

## 読み込めないとき・見つからないとき

- 各ページは、データの取得を `server/queries/load.ts` の `load` で包む。失敗しても例外にせず、画面の枠の中にエラー（`@home-expense/ui` の `LoadError` と「もう一度試す」= `router.refresh()`）を出す。一覧は絞り込みを操作できるまま残し、表の見出しの下に出す（別の条件を選んで回復できる）。HOME・年間レポートは年月の選択の下、登録・編集はフォームの位置に出す。
  - `load` は Next.js の内部の例外（`redirect`・`notFound` など）を `unstable_rethrow` でそのまま投げ直す。
- 編集画面は、API が 404 を返したら `notFound()` にする（`load(…, { notFoundOn404: true })`）。各 `[id]/not-found.tsx` が「この支出は見つかりませんでした」と一覧へのリンクを出す。存在しない URL は `app/not-found.tsx`。
- `app/error.tsx` は、どこにも当てはまらないエラーの最後の受け皿（文言は「予期せぬエラーが発生しました」）。
  - Next.js は、エラーの画面をすぐ出せるよう、`error.tsx` が使う CSS（`state.module.css`・`page-heading.module.css`・`LoadError.module.css`、約 1.1KB）を全ページで `<link rel="preload" as="style">` で先読みする。エラーが起きない限り使われないため、ブラウザのコンソールに「preloaded using link preload but not used within a few seconds」と警告が出る。`as` の指定は正しく、表示にも影響しないので、そのままにする（[Next.js の議論 #49607](https://github.com/vercel/next.js/discussions/49607)）。消すには `error.tsx` から CSS Modules をなくす必要があり、`LoadError` の見た目を二重に持つことになるため、しない。

## アクセシビリティ（WCAG 2.2 AA）

- 各ページに見えない `h1`（ページ名）を置く（`ui/parts/page-heading.tsx` の `withHeading`）。カードの見出しは `h2`。
- 画面の先頭に「本文へ移動」のリンクを置く（Tab で最初に現れ、`main#main` にフォーカスを移す）。
- 幅 767px 以下では 1 列にし、サイドバーはナビバーの「メニュー」のボタン（`aria-expanded`）で開閉する（`ui/parts/site-menu.tsx`）。メニューの中のリンクを押すと閉じる。表は横にスクロールさせず、スマートフォン用の並びにする（上の「一覧」）。
- 幅 767px 以下では、ヘッダー（メニューのボタン）が画面から見えなくなるまでスクロールすると（スマホでは約 74px）、右下（端から 16px）に「ページの先頭へ」の丸いボタン（44×44px）を出す（`ui/parts/back-to-top.tsx`）。スマホは画面全体がスクロールしてヘッダーも絞り込みも留めないので、長い一覧の下からメニューや絞り込みに戻りやすくするため。押すと先頭までなめらかにスクロールし（動きを減らす設定ではすぐ移る）、フォーカスを本文の先頭に移す。トーストが出ている間は、重ならないようトーストの高さの分だけ上にずらす（`body:has(output[popover]:popover-open)`）。ヘッダーが見えているかは IntersectionObserver で見る（スクロールのたびに計算しない）。メニューに手が届かなくなった時点で出すため。幅 768px 以上では本文の中だけがスクロールし、絞り込みも留めるので出さない。表は横にスクロールさせず、スマートフォン用の並びにする（上の「一覧」）。

## テスト

- ルートの `playwright.config.ts` に 2 つのプロジェクトがある。手元では、インストール済みの Chrome を使う（CI では Playwright の Chromium）。
  - `pnpm test:a11y`：Storybook を作り、すべての見本を axe（WCAG 2.2 AA のルール）で検査する。CI でも実行する。動きを減らす設定で検査する（表示途中の半透明を検査しないため）。読み込み中の表（`Loading`）は、内容を薄くする表示なのでコントラストの検査から外す。カレンダー（`Calendar`・`DateInput`）の機能のテスト（`e2e/storybook/calendar.spec.ts`）も、ここで一緒に動く。見た目を持たないカレンダー（`Calendar` の `Plain`）は、ブラウザ既定の小さなボタンのままなので、押す領域の大きさの検査から外す。Storybook の addon-a11y は見本を開くたびに axe を動かすため、テストでは `globals=a11y.manual:!true` を付けて止める（同時に動くと「Axe is already running」で失敗する）。検査の前に、動いているアニメーションが終わるのを待つ。
  - `pnpm test:e2e`：起動中のアプリ（`APP_URL`、既定は `http://localhost:3000`）とバックエンドに対して、全画面を幅 1440px と 390px で axe 検査し、横にはみ出さないこと・`h1` が 1 つあることを確かめる。ほかに、本文へ移動・ページ送り・移動中の枠・読み込めないとき・見つからないとき・スマートフォンのメニューを確かめる。バックエンドとデータベースが要るので、CI では実行しない。
  - はみ出しの検査（`e2e/layout.ts`）：スクロールする領域の中にある `position: absolute` の要素が、その領域の外の要素を位置の基準にしていないかを確かめる。基準が外にあると、領域にクリップされずに画面全体が伸び、ページ全体がスクロールしてしまう（HOME の「支出の多い順」の読み上げ用の文字で起きた）。
    - `pnpm test:a11y` では、すべての見本でこれを確かめる。BarList と Chart には、高さを決めてスクロールさせた領域に置く見本（`InScrollArea`）がある。
    - `pnpm test:e2e` では、全画面を 1440×900・1280×600・1024×768・800×420・390×844 で開き、これに加えて、横にはみ出さないことと、幅 768px 以上では画面全体が縦にスクロールしないことを確かめる。HOME の月と年間レポートの年を変えた後も確かめる。
  - 部品の外側や、中だけスクロールする領域は `position: relative` にして、読み上げ用の文字（`srOnly`）などの基準がその中に収まるようにする。
