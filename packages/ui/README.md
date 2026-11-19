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
- 棒の一覧（`BarList`）は、項目を多い順に横向きの棒と「金額（割合）」で並べる。HTML だけで描き、サーバーで出せる。系列（`series`）を 2 つ以上渡すと凡例を出し、読み上げでは項目名のあとに系列名を付ける（例：「家賃（固定費）」）。
  - HOME の支出の多い順では、固定費＝`--color-chart-fixed`（濃紺）、変動費＝`--color-chart-variable`（黄色）。7 つの候補を Figma で見比べて選んだ。2 色どうしは色覚の違いを含めてはっきり見分けられ（ΔE 43）、年間レポートの 3 色（青・オレンジ・緑）とも違う。
  - 黄色は白地とのコントラストが 3:1 未満（2.2）だが、各行に金額と割合の文字があり、凡例と読み上げで分類も分かるので、値と分類は色に頼らず読める。紫は、色覚によっては収入の青と見分けにくいので使わない。
- `Chart` はサーバーコンポーネントとして描ける（`"use client"` を付けない）。絵（凡例・目盛り・棒・線・点・データ表）はサーバーで描き、マウス・キーボード・ツールチップ・読み上げは `ChartInteraction`（`"use client"`）が受け持つ。サーバーからクライアントへは関数を渡せないため、ツールチップと読み上げの文言は `Chart` 側で整形した文字列で渡す。
  - 幅を測らずに描くため、横の位置はすべて割合で指定する。棒は HTML（`max(2px, min(24px, …%))` の幅）、点と目盛りの文字は SVG の `%`、線は `preserveAspectRatio="none"` の入れ子の SVG に描き、`vector-effect: non-scaling-stroke` で太さを保つ。点は楕円にならないよう、入れ子の SVG の外に置く。
  - 横軸の文字は 640px を想定して間引き、グラフの幅が 520px 以下のときは 1 つおきに隠す（コンテナクエリ）。線の間引きは 400 点を目安にする。
- `Chart/decimate.ts`（Largest Triangle Three Buckets）と `Chart/scales.ts` は、wc-line-chart の同名のファイルを移植したもの。変更点:
  - `decimate.ts`: 間引いた点の元の位置（index）を返す。移植元は間引き後の配列を元の x 座標で描くため、間引きが効くと線が左に縮んでいた。
  - `scales.ts`: 目盛りの範囲に 0 を必ず含める（金額のグラフで 0 を基準にするため）。
- 金額（`Amount`・`formatYen`）は「12,000円」と書き、￥の記号は使わない。マイナスは「−12,000円」と赤字にする。色だけに頼らず記号も付ける。
- 金額は右寄せにして一の位をそろえ、大小を比べやすくする。表の金額の列は、見出しと中身の両方に `align="end"`（`TableHeaderCell`・`TableCell`）を付ける。集計（`SummaryRow`・`BreakdownGroup`・`BreakdownItem`）の金額は、幅 `8em` の欄の中で右に寄せ、合計と内訳で右端をそろえる。内訳はカードの内側にあるため、項目名の欄をカードの余白と枠線の分だけ狭める。幅 767px 以下では項目名を残りの幅に広げ、合計の金額の右にカードの余白と枠線の分を空ける。
- 表（`Table`）の下の部品（`footer`。ページネーションなど）の上には区切りの線を引き、スクロールする領域の最後の行の下線は消す。横にスクロールするとき、スクロールバーが表の中に収まり、下の部品と重ならないようにするため（Safari ではスクロールバーが最後の行の下に出る）。
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
- `src/reset.css` はブラウザの標準のスタイルを打ち消す最小限のリセット。アプリ（`app/src/app/layout.tsx`）と Storybook（`.storybook/preview.ts`）の両方で、`tokens.css` より先に読み込む。設定の根拠は下の「リセット CSS の根拠」を参照。

## カレンダー（Calendar・DateInput）

ブラウザ標準の日付ピッカーは、開いたときのカレンダーに CSS が届かない。そこで、標準と同じ機能を持ち、見た目を CSS だけで決められるカレンダーを作った。

- `Calendar` は見た目を持たない（plain）。CSS を一切読み込まず、部品に `data-part` を、状態に `data-*` を付ける。外から当てた CSS だけで見た目が決まる（見本：`Plain`・`Default`・`CustomTheme`）。
  - 部品（`data-part`）：`root`・`header`・`previous`・`title`・`next`・`icon`・`grid`・`weekday`・`week`・`cell`・`day`・`months`・`month-item`・`month`・`footer`・`clear`・`today`
  - 状態：`data-selected`（選んだ日）・`data-today`（今日・今月）・`data-outside`（前後の月の日）・`data-disabled`（`min`・`max`・`step` で選べない日）・`data-weekday`（0=日曜〜6=土曜）・`data-view`（`root` に付く。`days` か `months`）
  - 前月・次月のアイコンは `previousIcon`・`nextIcon` で差し替える（既定は「‹」「›」）。
- 機能は、次の一覧を基準にブラウザ標準のピッカーとそろえる。各項目は `e2e/storybook/calendar.spec.ts` の同じ ID のテストで確かめる（`pnpm test:a11y` で、作った Storybook に対して動く。今日の日付は 2026-11-20 に固定する）。

| ID  | 要件                                                                                                                                 | 出典                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | 選ぶと、欄に `yyyy/mm/dd`、送る値（`name` の付いた隠し欄）に `YYYY-MM-DD` が入り、欄で `input` と `change` が 1 回ずつ起きる         | [HTML: Date state](https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date))、[HTML: input と change](https://html.spec.whatwg.org/multipage/input.html#common-input-element-events) |
| V2  | 値が空のときは、今日の月を開き、今日にフォーカスする                                                                                 | [APG: Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)                                                                                         |
| V3  | 値があるときは、その日の月を開き、その日を選択済みにしてフォーカスする                                                               | APG: Date Picker Dialog                                                                                                                                                                              |
| V4  | `min`・`max` の外の日は選べず、外の月へは移れない                                                                                    | [HTML: min と max](https://html.spec.whatwg.org/multipage/input.html#the-min-and-max-attributes)                                                                                                     |
| V5  | `step`（日数）に合わない日は選べない。基準は `min`、なければ初期値（`defaultValue`）、なければ 1970-01-01                            | [HTML: step](https://html.spec.whatwg.org/multipage/input.html#the-step-attribute)                                                                                                                   |
| V6  | `readonly` のときは、カレンダーを開けない                                                                                            | [HTML: readonly](https://html.spec.whatwg.org/multipage/input.html#the-readonly-attribute)                                                                                                           |
| V7  | `disabled` のときは、カレンダーを開けない                                                                                            | [HTML: disabled](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-disabled)                                                                                           |
| V8  | `required` でなければ「クリア」で空にでき、`required` なら「クリア」を出さない                                                       | Chrome のピッカー（「クリア」ボタン）                                                                                                                                                                |
| V9  | 0001-01-01 から 275760-09-13 までを扱い、その外へは移れない                                                                          | [ECMAScript: 時刻の範囲](https://tc39.es/ecma262/#sec-time-values-and-time-range)（Chrome の上限と同じ）                                                                                             |
| F1  | 欄は `yyyy/mm/dd` で表示し、送る値は `YYYY-MM-DD` にする                                                                             | 独自の方針（並び順をブラウザ・OS の言語設定によらず固定する）                                                                                                                                        |
| F2  | 数字だけを打つと `/` を自動で入れる                                                                                                  | 独自の方針                                                                                                                                                                                           |
| F3  | 1 桁の月・日も受け付け、欄を離れると 0 を補う                                                                                        | 独自の方針                                                                                                                                                                                           |
| F4  | 形式が違う日・`min`・`max`・`step` の外の日は、欄を無効（`setCustomValidity`）にし、打った文字のまま送る（サーバーの検証で知らせる） | [HTML: 制約の検証](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints)                                                                                              |
| F5  | 欄は文字の欄（`type="text"`）で、押してもブラウザ標準のカレンダーは出ない                                                            | 独自の方針                                                                                                                                                                                           |
| K1  | 矢印キーで前後の日と前後の週に移り、月をまたぐと月が変わる                                                                           | APG: Date Picker Dialog                                                                                                                                                                              |
| K2  | Home・End で週の始めと終わりに移る（`weekStartsOn` に従う）                                                                          | APG: Date Picker Dialog                                                                                                                                                                              |
| K3  | PageUp・PageDown で前後の月に移り、同じ日がなければ月末にする                                                                        | APG: Date Picker Dialog                                                                                                                                                                              |
| K4  | Shift を付けると前後の年に移る                                                                                                       | APG: Date Picker Dialog                                                                                                                                                                              |
| K5  | Enter・Space で選び、閉じて、開いたボタンにフォーカスを戻す                                                                          | APG: Date Picker Dialog                                                                                                                                                                              |
| K6  | Esc で値を変えずに閉じ、開いたボタンにフォーカスを戻す                                                                               | APG: Date Picker Dialog                                                                                                                                                                              |
| K7  | 外を押すと値を変えずに閉じる                                                                                                         | [HTML: ポップオーバーの light dismiss](https://html.spec.whatwg.org/multipage/popover.html#popover-light-dismiss)                                                                                    |
| K8  | 前の月・次の月のボタンで月を移る                                                                                                     | APG: Date Picker Dialog                                                                                                                                                                              |
| K9  | 見出しを押すと月を選ぶ画面になり、選ぶと日の表に戻る                                                                                 | Chrome のピッカー（年と月を選ぶ画面）                                                                                                                                                                |
| K10 | 「今日」で今日を選んで閉じる                                                                                                         | Chrome のピッカー（「今日」ボタン）                                                                                                                                                                  |
| A1  | 開くボタンは `aria-haspopup="dialog"` と `aria-expanded` を持ち、開いた dialog に名前がある                                          | APG: Date Picker Dialog                                                                                                                                                                              |
| A2  | 日は年月日と曜日で読み、今日（`aria-current="date"`）と選んだ日を伝える。表は見出しの年月を名前にする                                | APG: Date Picker Dialog                                                                                                                                                                              |
| T1  | タッチの画面でも同じカレンダーを使う                                                                                                 | 独自の方針（どの端末でも同じ見た目と並び順にするため）                                                                                                                                               |

- 基準と違うところ（意図して変えたもの）
  - 選んだ日は、APG の `gridcell` の `aria-selected` ではなく、ボタンの `aria-pressed` で伝える。`td` に `role` を付けると Biome の a11y の規則に反するため。
  - APG はモーダルの dialog だが、ポップオーバー（モーダルではない）で開く。Tab でカレンダーの外に出られ、外を押すと閉じる。標準のピッカーと同じ動き。
  - 範囲の外へ移るキー操作は、範囲の端で止まる。
  - 言語と週の始まりは、ブラウザの言語に従わず、日本語・日曜始まりに固定する（このアプリは日本語だけのため）。週の始まりは `weekStartsOn` で変えられる。
- まだ確かめていないこと
  - テストは Chrome だけで動かしている。Safari は目で見て確かめた。
  - 「Chrome のピッカー」が出典の項目（V8・K9・K10）は、Chrome の画面を見て突き合わせてはいない。
  - VoiceOver での読み上げと、iPhone の Safari での動き。
- 値は `input type="date"` と同じ `YYYY-MM-DD` の文字列で受け渡す。空文字は未選択。
- デザインシステムの見た目（既定の見た目）は `Calendar/CalendarTheme.module.css` にまとめ、`className` で当てる。Figma の「コンポーネント」ページの「カレンダー」に同じ見た目の部品がある。
  - カレンダー（表示=日・月）：幅 304px、内側の余白 `--space-300`、部品の間 `--space-200`、面・枠線・角丸 `--radius-200`・`--shadow-raised`。ポップオーバー（`DateInput`）は見た目を持たず、カレンダーの外枠がそのまま見える。
  - カレンダー/日（`data-part="day"`）：36×36、セルの余白 `--space-50`。ホバー・押下・選択中は `--color-interactive-*`、今日は `--border-width` の枠（`--color-text`）、選べない日は `--color-text-disabled` と打ち消し線、前後の月の日は空き（白地で読めるコントラストの色がないため隠す）。
  - カレンダー/月（`data-part="month"`）：3 列で幅いっぱい、高さ 40px。状態は日と同じ。
  - カレンダー/操作：前へ・次へ（32×32、アイコン 20px）、見出し（文字/小見出し）、今日・クリア（文字/本文（1行））。
  - 曜日は文字/補足。日曜の文字は `--color-calendar-sunday`（Figma の補助カラー カレンダー/日曜 → 赤/900）。
  - Figma の打ち消し線は、文字の装飾ではなく線の層で描く。文字のプロパティでつないだ文字は、バリアントをまたいで装飾が共有されるため。
- `DateInput` は、`yyyy/mm/dd` で打つ文字の欄の横にボタンを置き、ポップオーバー（Popover API）で `Calendar` を開く。
  - 標準の `<input type="date">` は使わない。並び順がブラウザ・OS の言語設定で決まり（英語の設定なら mm/dd/yyyy）、Safari などでは数字を押すと標準のカレンダーが出るため。
  - 欄は `type="text"`・`inputmode="numeric"`。`defaultValue`・`min`・`max` は `YYYY-MM-DD` で受け取り、欄には `yyyy/mm/dd` で出す。
  - フォームには、`name` を付けた隠し欄で `YYYY-MM-DD` を送る（打った文字が日付として読めないときは、打った文字のまま送る）。サーバーの検証（`app/src/core/form/validation.ts`）は今のまま使える。
  - 隠し欄の値は state で持つ。隠し欄に `defaultValue` を渡すと、React が描き直すたびに `defaultValue` を当て直し、隠し欄では値も一緒に戻ってしまうため。
  - フォームの `reset`（React 19 はサーバーの処理のあとに自動で行う）では、欄が `defaultValue` に戻ったあとに隠し欄を合わせ直す。
  - カレンダーで選んだ日は欄に入れ、`input`・`change` を発生させる（React の `onChange` も動く）。
  - 閉じると、フォーカスは開いたボタンに戻る（`popovertarget` の標準の動き）。画面の大きさが変わったら閉じる。
  - `required` のときは「クリア」を出さない。
  - アプリでは、支出・収入のフォームの支払日・受取日（`app/src/ui/parts/expense-form.tsx`・`income-form.tsx`）で使う。

## リセット CSS の根拠

方針：ブラウザごとの標準のスタイルの差をなくし、見た目を Figma に合わせる。迷う設定は「Figma と同じ見え方になるか」で決める。各設定の出典は 2026 年 11 月に確認した。

| 設定                                                                                    | 理由                                                                                                                                                                                                                                                                                                                                                              | 出典                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全体を `@layer reset` で包む                                                            | レイヤーに入れていないスタイルは、レイヤーの中のスタイルに必ず勝つ。リセットのセレクタの強さに関係なく、部品の CSS が優先される。`@layer` は 2022 年 3 月から Baseline（主要ブラウザで広く使える）。                                                                                                                                                              | [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)                                                                                                                                                                                                                                           |
| すべての要素と疑似要素を `box-sizing: border-box`                                       | 幅と高さに枠線と内側の余白を含める。Figma の部品の大きさ（枠線を含む）と同じ測り方になる。                                                                                                                                                                                                                                                                        | [MDN: box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)、[modern-normalize](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css)                                                                                                                              |
| `html` に `-webkit-text-size-adjust: 100%` と `text-size-adjust: 100%`                  | スマートフォンのブラウザが、横向きにしたときなどに文字を勝手に大きくするのを防ぐ。iOS の Safari は接頭辞付きにだけ対応しているため、両方を書く（stylelint の接頭辞の規則は、この行だけ外す）。MDN では実験的な機能で、Baseline ではない（対応しないブラウザでは無視される）。                                                                                     | [MDN: text-size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust)、[MDN の互換性データ](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-size-adjust.json)、[modern-normalize](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css) |
| `html` に `text-autospace: no-autospace`                                                | 漢字・かなと英数字のあいだに自動で空きを入れない。Figma は空きを入れないため。仕様上の初期値は `normal`（空きを入れる）で、2025 年 11 月から Baseline だが、Chrome 157 の初期値は `no-autospace` で、ブラウザによって違う可能性があるため明示する。                                                                                                               | [MDN: text-autospace](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace)                                                                                                                                                                                                                           |
| `body` の `margin: 0`                                                                   | ブラウザが標準で付ける 8px の余白を消す。                                                                                                                                                                                                                                                                                                                         | [modern-normalize](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css)                                                                                                                                                                                                              |
| `body` に `-webkit-font-smoothing: antialiased` と `-moz-osx-font-smoothing: grayscale` | macOS のブラウザは、標準では文字の線を太らせて描く。Figma はこれをしないため、同じ文字列を描くとインクの量が Figma より約 24% 多かった。この指定で差が 1% 未満になった。標準外の機能で、MDN は「本番では使わないことを勧める。ただし標準の代わりがない場合は除く」としている。標準の代わりがなく、Figma に合わせる目的で、承知のうえで使う。効くのは macOS だけ。 | [MDN: font-smooth](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth)                                                                                                                                                                                                                                 |
| 見出し・段落・`figure`・`blockquote`・`dl`・`dd` の `margin: 0`                         | ブラウザの標準の上下の余白を消し、余白は部品の CSS（トークン）だけで決める。リストの余白と点は意味を持つことがあるので打ち消さず、部品ごとに指定する。                                                                                                                                                                                                            | [WHATWG HTML: Rendering（ブラウザの標準のスタイル）](https://html.spec.whatwg.org/multipage/rendering.html)                                                                                                                                                                                                      |
| 画像・`picture`・動画・`canvas` を `display: block; max-width: 100%`                    | 行の下にできる隙間をなくし、親より横に広がらないようにする。アイコンの `svg` は文字の行の中に置くことがあるので対象外。                                                                                                                                                                                                                                           | [MDN: display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)                                                                                                                                                                                                                                         |
| 入力欄・ボタン・`select`・`textarea` の `margin: 0` と `font: inherit`                  | ブラウザはフォーム部品に端末のフォントと 13px 前後の大きさを使い、Firefox と Safari は余白も付けるため。親の文字の設定を受け継がせ、余白を消す。                                                                                                                                                                                                                  | [modern-normalize](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css)                                                                                                                                                                                                              |

入れなかったもの：

| 設定                                                                                                   | 入れない理由                                                                                                       | 出典                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `line-break: strict`（行頭禁則を厳しくする）                                                           | Figma には禁則の強さを変える設定がなく、標準の禁則で折り返す。合わせるため、ブラウザの標準（`auto`）のままにする。 | [MDN: line-break](https://developer.mozilla.org/en-US/docs/Web/CSS/line-break)                                                                                                                                           |
| `word-break: auto-phrase`（日本語を文節で折り返す）                                                    | Chrome と Edge だけが対応し、Firefox と Safari は未対応。Figma も文節で折り返さない。                              | [MDN: word-break](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)、[Can I use](https://caniuse.com/wf-word-break-auto-phrase)、[Chrome for Developers](https://developer.chrome.com/blog/css-i18n-features) |
| `text-wrap: balance`・`pretty`                                                                         | Figma は行の長さを揃えない。このアプリの見出しは短く、長い段落もない。                                             | [MDN: text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)                                                                                                                                             |
| `interpolate-size: allow-keywords`                                                                     | Baseline ではない。高さを動かすアニメーションがない。                                                              | [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)                                                                                                                               |
| `text-spacing-trim`                                                                                    | 初期値の `normal` で、標準的な約物の詰め方になる。                                                                 | [MDN: text-spacing-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim)                                                                                                                             |
| modern-normalize のそのほかの設定（`b`・`strong`、`sub`・`sup`、検索欄、ファイル選択、`summary` など） | このアプリでは該当する要素を使っていないか、部品ごとに指定している。                                               | [modern-normalize](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css)                                                                                                                      |

- ボタン（`Button`・`ButtonLink`）は高さ 40px・最小幅 `--size-control-min`（120px）。Figma は枠線を内側に描くので、内側の余白は `--space-300` から枠線の太さを引く（枠線と合わせて 12px）。
- 行の高さは px で決める（本文・金額 22px、補足 20px、小見出し 24px、見出し 29px、1 行 16px）。Figma は行の高さを行ごとに整数の px に丸めて描くため、割合（140% など）のままだとブラウザと端数がずれ、行が重なるほど差が開く。Figma の文字スタイルも px で持ち、トークンは継承の問題を避けるため単位なしの `calc(行の高さ / 文字の大きさ)` で書く。`check-tokens.mjs` は、この割合と Figma の px を文字の大きさで割った値を比べる。
