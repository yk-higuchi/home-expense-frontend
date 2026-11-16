# @home-expense/ui

家計簿アプリの UI 部品ライブラリです。Next.js から独立していて、Storybook で部品ごとに確認できます。

- デザイン: Figma「家計簿」（コンポーネントページ）
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

## 実装メモ

- Storybook の設定（`.storybook/main.ts`）では、アドオンとフレームワークを絶対パスで指定している。pnpm のモノレポでパッケージを確実に解決するため。
- 入力欄・プルダウンの高さは `--size-control`（40px）に固定し、上下の余白は付けない。上下に余白を取ると文字の表示領域が 16px しか残らず、Noto Sans JP の文字の上下が欠けるため（文字はブラウザが上下中央に置く）。
- 無効のプルダウン・入力欄は、ラベルと説明も無効の文字色にする（Figma: 状態=無効）。
- フォーカスは、部品との間に 2px の隙間を空けて 2px の線（`--focus-ring-offset`・`--focus-ring-width`）。全部品で共通。
- 集計の部品（`Summary`）は、金額の列の位置（行の左端から 283px、幅 767px 以下では行の半分）を基準にする。合計行・内訳の見出し・内訳行の項目名の幅は、この値から左側にあるもの（余白・アイコン・間隔）を引いて求める。
- グラフ（`Chart`）の色は項目ごとに固定する（収入=1・支出=2・収支=3）。順位で変えない。3 番は白地とのコントラストが 3:1 未満なので、データ表を必ず併せて出す。`showTable={false}` は、同じ値の表が画面にすでにあるときだけ使う。
- `Chart` はサーバーコンポーネントとして描ける（`"use client"` を付けない）。絵（凡例・目盛り・棒・線・点・データ表）はサーバーで描き、マウス・キーボード・ツールチップ・読み上げは `ChartInteraction`（`"use client"`）が受け持つ。サーバーからクライアントへは関数を渡せないため、ツールチップと読み上げの文言は `Chart` 側で整形した文字列で渡す。
  - 幅を測らずに描くため、横の位置はすべて割合で指定する。棒は HTML（`max(2px, min(24px, …%))` の幅）、点と目盛りの文字は SVG の `%`、線は `preserveAspectRatio="none"` の入れ子の SVG に描き、`vector-effect: non-scaling-stroke` で太さを保つ。点は楕円にならないよう、入れ子の SVG の外に置く。
  - 横軸の文字は 640px を想定して間引き、グラフの幅が 520px 以下のときは 1 つおきに隠す（コンテナクエリ）。線の間引きは 400 点を目安にする。
- `Chart/decimate.ts`（Largest Triangle Three Buckets）と `Chart/scales.ts` は、wc-line-chart の同名のファイルを移植したもの。変更点:
  - `decimate.ts`: 間引いた点の元の位置（index）を返す。移植元は間引き後の配列を元の x 座標で描くため、間引きが効くと線が左に縮んでいた。
  - `scales.ts`: 目盛りの範囲に 0 を必ず含める（金額のグラフで 0 を基準にするため）。
- 金額（`Amount`）のマイナスは「−￥12,000」と赤字にする。色だけに頼らず記号も付ける。
- `ErrorMessage` は `role="alert"` を付けて読み上げさせる。入力欄ごとのエラーは `TextInput`・`Select` の `errorMessage` を使う。
- `SubmitButton` は、親の `<form>` が送信中のあいだ自動で「処理中」になる（React 19 の `useFormStatus`）。

## 並べ替え（Sortable）

ライブラリを使わず、Pointer Events で作っている。表の行をドラッグで並べ替えるときに使う（見本: Storybook の Components/Sortable）。

```tsx
const { handleProps, rowProps, canMove, moveBy, announcement } = useSortableList({
  items,
  getId: (item) => item.id,
  getLabel: (item) => item.name,
  onReorder: (ids) => save(ids),
});

<TableRow key={item.id} {...rowProps(item)}>
  <TableCell><DragHandle {...handleProps(item)} /></TableCell>
  …
  <TableCell>
    <ReorderButtons
      label={item.name}
      onMoveUp={() => moveBy(item, -1)}
      onMoveDown={() => moveBy(item, 1)}
      canMoveUp={canMove(item, -1)}
      canMoveDown={canMove(item, 1)}
    />
  </TableCell>
</TableRow>
<SortableStatus message={announcement} />
```

- `onReorder(ids, { from, to })` は、並べ替えが確定したときに、新しい ID の並びと、動かす前・動かしたあとの位置（0 始まり）で 1 回だけ呼ばれる（ドラッグを離したとき、キーボードで確定したとき、上へ・下へを押したとき）。並びは呼び出し側が持つ。
- マウス・タッチ: つまみを押して動かす。ドラッグ中はウィンドウ全体で `pointermove`・`pointerup`・`pointercancel` を受ける（ポインタの捕捉は外れることがあるため、それだけに頼らない）。ボタンが押されていない `pointermove` が来たら（外で離した `pointerup` を受け取れなかったとき）、その位置で離したとみなす。ウィンドウのフォーカスが外れたら取り消す。スクロールする枠の上下の端に近づくと、自動でスクロールする。Esc で取り消す。
- ドラッグ中は行を動かさず、持っている行を半透明にし、落とす位置に線を出す。行の DOM を動かすと、ポインタの捕捉が外れることがあるため。
- キーボード: つまみで Space・Enter を押して持ち上げ、↑↓ で動かし、Space・Enter で確定、Esc で取り消す。フォーカスが外れても取り消す。
- 読み上げ: 持ち上げ・移動・確定・取り消しを `SortableStatus`（`aria-live`）で伝える。
- 上へ・下へのボタンは、ドラッグせずに 1 回の操作で並べ替える手段（WCAG 2.2 の 2.5.7）。
- つまみの列の幅は 64px 以上にする（ボタン 28px ＋ セルの左右の余白）。
- `Toast` は、HTML の Popover API（`<output popover="manual">`）で最前面の層（top layer）に出す。z-index を考えなくても、ダイアログを含むほかの要素の上に出る。`manual` なので、ほかの場所を押しても勝手に閉じない。表示された瞬間の読み上げは読み上げソフトによって違うため、読み上げは別の見えない領域で行う（成功は `role="status"`、エラーは `role="alert"`。トーストの `output` は `aria-live="off"`）。知らせは `{ id, text, tone }` で渡し、同じ文言でも `id` が変われば出し直す。知らせは `useToast` で作る（`success` / `error` / `clear`。`id` は自動で振る）。`tone: "error"` は赤（`--color-danger-surface` / `--color-danger-border` / `--color-danger`）と警告アイコンで出し、自動では消さない。
- 金額などの整形（`formatYen` / `formatCompact`）は `src/format/format.ts` に置く。部品の入口（`@home-expense/ui`）からも使えるが、Server Action などのサーバー側のコードからは `@home-expense/ui/format` を読む（部品をまとめて読み込まないため）。
- サーバーコンポーネントからも使えるよう、フックやイベントが要らない部品には `"use client"` を付けない（`Select`・`TextInput` は `useId` だけなので付けない）。
- `ButtonLink` はボタンの見た目のリンク。画面の移動はボタンではなくリンクにする（新しいタブで開け、URL をコピーできる）。Next.js では `linkComponent={Link}` を渡す。
- `Pagination` は `hrefFor` を渡すと、ページの番号を `<a href>` で描く（サーバーで描ける）。`onPageChange` だけを渡すと、今までどおりボタンで描く。前・次がないときは `aria-disabled` の `span` にする。
- `Skeleton` は読み込み中に文字や金額の代わりに出す灰色の帯（`--color-skeleton`）。静止させる。`TextInput`・`Select`・`Button` の `skeleton` は、読み込み中の軽い見た目（白地・通常の枠線・無効の文字色、操作できない）。
- `LoadError` はデータを読み込めないとき・見つからないときに、データが入るはずの枠の中に出す（アイコン・文言・`action` のボタンやリンク、`role="alert"`）。
- 文字の色（`--color-text`、#636363）は、白地と水色の背景（選択中・押下中を含む）の上で 4.5:1 以上になる色にする。入力欄の枠線（`--color-input-border`、#8c8c8c）は、白地と 3:1 以上にする（WCAG 1.4.11）。表やカードの枠線（`--color-border`）は飾りなので対象外。
- サイドバーの選択中の項目は、背景色に加えて太字にする（色だけに頼らない）。
- 表のセルは省略せずに折り返す。表は最小幅 880px で、狭い画面では表の部分（`aria-label` 付きの `section`、キーボードでもスクロールできるよう `tabIndex=0`）だけを横にスクロールする。ページ送りは折り返す。
- `Pagination` の前・次の文字を空にしたときは、見えない「前のページ」「次のページ」を入れる。
- `NavBar` の `start` に、ナビバーの左に置く要素（スマートフォンのメニューのボタン）を渡せる。
- `src/reset.css` はブラウザの標準のスタイルを打ち消す最小限のリセット。アプリ（`app/src/app/layout.tsx`）と Storybook（`.storybook/preview.ts`）の両方で、`tokens.css` より先に読み込む。中身と理由は次のとおり。
  - `box-sizing: border-box`（疑似要素も含む）：幅・高さに枠線と内側の余白を含める。Figma の部品の大きさ（枠線を含む）と同じ測り方にするため。
  - `text-size-adjust: 100%`：スマートフォンを横向きにしたときなどに、ブラウザが文字を勝手に大きくしないようにする。
  - `body` の `margin: 0`：ブラウザの標準の 8px の余白を消す。
  - `-webkit-font-smoothing: antialiased`・`-moz-osx-font-smoothing: grayscale`：macOS のブラウザが文字の線を太らせて描くのをやめ、Figma と同じ太さの見え方にする（Windows などには効かない）。同じ文字列を描いて比べると、既定ではインクの量が Figma より約 24% 多く、この指定で 1% 未満の差になった。
  - 見出し・段落・`figure`・`blockquote`・`dl`・`dd` の `margin: 0`：ブラウザの標準の上下の余白を消し、余白は部品の CSS（トークン）だけで決める。リストの余白と点は、意味を持つことがあるため打ち消さず、部品ごとに指定する。
  - 画像・動画・`canvas` を `display: block; max-width: 100%`：行の下にできる隙間をなくし、親より広がらないようにする。アイコンの `svg` は行の中に置くことがあるので対象外。
  - 入力欄・ボタン・`select`・`textarea` の `font: inherit`：ブラウザはフォーム部品に端末のフォントと 13px 前後の大きさを使うため、親の文字の設定を受け継がせる。
