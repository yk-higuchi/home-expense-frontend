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

## 実装メモ

- Storybook の設定（`.storybook/main.ts`）では、アドオンとフレームワークを絶対パスで指定している。pnpm のモノレポでパッケージを確実に解決するため。
- 入力欄・プルダウンの高さは `--size-control`（40px）に固定し、上下の余白は付けない。上下に余白を取ると文字の表示領域が 16px しか残らず、Noto Sans JP の文字の上下が欠けるため（文字はブラウザが上下中央に置く）。
- 無効のプルダウン・入力欄は、ラベルと説明も無効の文字色にする（Figma: 状態=無効）。
- フォーカスは、部品との間に 2px の隙間を空けて 2px の線（`--focus-ring-offset`・`--focus-ring-width`）。全部品で共通。
- 集計の部品（`Summary`）は、金額の列の位置（行の左端から 283px）を基準にする。合計行・内訳の見出し・内訳行の項目名の幅は、この値から左側にあるもの（余白・アイコン・間隔）を引いて求める。
- グラフ（`Chart`）の色は項目ごとに固定する（収入=1・支出=2・収支=3）。順位で変えない。3 番は白地とのコントラストが 3:1 未満なので、データ表を必ず併せて出す。`showTable={false}` は、同じ値の表が画面にすでにあるときだけ使う。
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
