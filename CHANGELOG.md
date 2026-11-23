# Changelog

## [1.4.0](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.3.0...v1.4.0) (2026-11-23)


### Features

* **ui:** フォーカスの状態がなかった部品に、Figma のフォーカスのデザインを足す ([ae6174c](https://github.com/yk-higuchi/home-expense-frontend/commit/ae6174cadb533e44c56252033bb9e7567dd037f3))
* **ui:** フォーカスの色を濃い青緑にし、入力欄は 1 本の線、プルダウンの一覧は背景の色で示す ([ad81409](https://github.com/yk-higuchi/home-expense-frontend/commit/ad81409b21791750c9c6fe9b31a172e2caf514f7))
* **ui:** プルダウンをマウスで押したときも、入力欄と同じフォーカスの線を出す ([3e74e77](https://github.com/yk-higuchi/home-expense-frontend/commit/3e74e77d13882e564f15871b460ef174e851bd63))


### Bug Fixes

* **ui:** エラーの入力欄のフォーカスは赤い線に戻し、Figma に「エラー（フォーカス）」の状態を足す ([8bce514](https://github.com/yk-higuchi/home-expense-frontend/commit/8bce5145494ef4a4e812bd7f8d4ffeb584037ff8))
* **ui:** エラーの入力欄も、フォーカスの間はフォーカスの色の線にする ([573be23](https://github.com/yk-higuchi/home-expense-frontend/commit/573be233e9e9eefaf37bb76c9557993bd8d0a0dd))
* **ui:** プルダウンの一覧の移っている選択肢を、フォーカスの色で塗り、文字を白にする ([4a2fb76](https://github.com/yk-higuchi/home-expense-frontend/commit/4a2fb7602c65ac7e7fe464cdae9561ba9a1def2f))
* **ui:** プルダウンの一覧をホイールでスクロールしたとき、ポインターの下の選択肢に移る ([ff53ecc](https://github.com/yk-higuchi/home-expense-frontend/commit/ff53ecc80469d272fc9de84d6db7b9cafc8a9668))

## [1.3.0](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.2.0...v1.3.0) (2026-11-23)


### Features

* **app:** スマホで、下までスクロールしたら「ページの先頭へ」のボタンを出す ([a7b3206](https://github.com/yk-higuchi/home-expense-frontend/commit/a7b3206ec18a27516aff8ec22224301e049f5c1f))
* **app:** スマホで、支出の一覧の「追加」を絞り込みの上の行に出す ([36c2f16](https://github.com/yk-higuchi/home-expense-frontend/commit/36c2f16b8cbbd5fa3c807302adb92dec74d93e50))
* **app:** 幅 768px 以上で、サイドメニューを隠せるようにする ([fabef36](https://github.com/yk-higuchi/home-expense-frontend/commit/fabef36a15a0cf7538fc6855776bfeef6a16cbc9))
* **app:** 幅 768px 以上で、年間レポートと HOME の年月の選択を本文の上に留める ([027778a](https://github.com/yk-higuchi/home-expense-frontend/commit/027778acdf3eb4ab094060a1c491b93a922fa661))
* **app:** 支出・収入の登録画面で、日付の初期値を今日にする ([b33b171](https://github.com/yk-higuchi/home-expense-frontend/commit/b33b171ba0be3e067525b6daf6d15c51bf8e97ed))
* **app:** 登録・編集の画面に「一覧に戻る」を付ける ([bcb6d7d](https://github.com/yk-higuchi/home-expense-frontend/commit/bcb6d7de77b28b93eb08d45f9d412a472fdfecd9))
* **app:** 集計の画面の固定費・変動費の内訳を、最初は閉じておく ([940febd](https://github.com/yk-higuchi/home-expense-frontend/commit/940febd226799a8716bb608f86d45a8c23ebf5fa))
* **ui:** グラフと並べ替えの操作で、文字を選べないようにする ([42848a4](https://github.com/yk-higuchi/home-expense-frontend/commit/42848a46ad3ce2d1f90610cd318fca77caf71883))
* **ui:** 日付入力のカレンダーに「今日」のボタンを出さない ([fd5ef46](https://github.com/yk-higuchi/home-expense-frontend/commit/fd5ef46808fa28ab57a5a6ee4e9374dfe2a7ddb5))
* 並べ替えの保存中に「並び順を保存しています…」のトーストを出す ([138374a](https://github.com/yk-higuchi/home-expense-frontend/commit/138374aecc80867b8623f4e4e67d8d437ab76e2c))
* 幅 768px 以上で、一覧の表の中だけをスクロールし、見出しの行を留める ([4e4730b](https://github.com/yk-higuchi/home-expense-frontend/commit/4e4730b3e2123c76336bd150ffc77c10e7c3f027))
* 送信に失敗したら、最初のエラーの欄にフォーカスを移す ([1b90509](https://github.com/yk-higuchi/home-expense-frontend/commit/1b90509802ce2913c2b22866d8a2e38734861e84))


### Bug Fixes

* **app:** 「ページの先頭へ」を、少しスクロールしてヘッダーが見えなくなったら出す ([8631a86](https://github.com/yk-higuchi/home-expense-frontend/commit/8631a863de682d827c9ef8c06499bf3c2dff82a2))
* **app:** スマホで短いページのヘッダーが縦に伸びないようにする ([6d9a3ea](https://github.com/yk-higuchi/home-expense-frontend/commit/6d9a3ea8408691f7eb668a535aedc66dea6731da))
* **app:** ブラウザで戻ったとき、絞り込みの表示を URL に合わせる ([7406cd5](https://github.com/yk-higuchi/home-expense-frontend/commit/7406cd51d50daa77a984a21b772bede6fb3806a0))
* **app:** 本文を一番下までスクロールしたとき、下の余白が付くようにする ([bc46531](https://github.com/yk-higuchi/home-expense-frontend/commit/bc46531e3f10ac25cdd3796684a42bc20323ee3d))
* **app:** 絞り込みが折り返す幅では、どの画面の幅でも「追加」を絞り込みの上に出す ([12fa017](https://github.com/yk-higuchi/home-expense-frontend/commit/12fa017b4bb188331d97866437cc42b56f049dbc))
* **app:** 表の列の幅を見直し、タッチの端末で操作のボタンがはみ出さないようにする ([675671e](https://github.com/yk-higuchi/home-expense-frontend/commit/675671e3f5d1567fbe4959cb98c781d3d51cd2a1))
* **ui:** プルダウンの一覧が画面の幅を超えないようにする ([664c6af](https://github.com/yk-higuchi/home-expense-frontend/commit/664c6af3267fa024405d373074021a392f90cf81))
* **ui:** ページの番号を背景の四角の真ん中に置き、前へ・次へを日本語にする ([fcd00f5](https://github.com/yk-higuchi/home-expense-frontend/commit/fcd00f5bdb245ea5a0ce7a5c08d2d08828e1038b))
* タブレットの幅で、列に余裕があるのに表が横にスクロールしないようにする ([cb6e1ff](https://github.com/yk-higuchi/home-expense-frontend/commit/cb6e1ff2c626436ce7b78ece15af5570277084d3))

## [1.2.0](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.1.2...v1.2.0) (2026-11-20)


### Features

* **ui:** カレンダーの既定の見た目を Figma の部品とデザイントークンに合わせる ([48148c7](https://github.com/yk-higuchi/home-expense-frontend/commit/48148c745d180bf6bd1dee3dbd5462c7b41e6ed2))
* **ui:** カレンダーの見出しの文字を日付と同じ大きさにする ([f4ed42f](https://github.com/yk-higuchi/home-expense-frontend/commit/f4ed42f770af422ac0cfe9e91304ed3e2347991f))
* **ui:** プルダウンの選択肢と一覧を Figma の部品の対応に足す ([fe0a3d1](https://github.com/yk-higuchi/home-expense-frontend/commit/fe0a3d144dac57d656d75bd1f8f4128a45e6a543))
* **ui:** プルダウンの選択肢の一覧を自前で描き、どのブラウザでも同じ見た目にする ([54c863f](https://github.com/yk-higuchi/home-expense-frontend/commit/54c863fbfee90f729e910531997576d1eb35ba93))
* **ui:** プルダウンを開いたとき、選んでいる選択肢を一覧の真ん中に出す ([829da54](https://github.com/yk-higuchi/home-expense-frontend/commit/829da546ac0d149a2631504c291f1bc66b6e595b))
* **ui:** 日付の入力欄を yyyy/mm/dd の文字の欄にする ([cb57ad7](https://github.com/yk-higuchi/home-expense-frontend/commit/cb57ad728aa6ebe914c1cac1969c5641ba1f80ca))
* **ui:** 日付入力とカレンダーのアイコンを Figma の部品の対応に足す ([9489251](https://github.com/yk-higuchi/home-expense-frontend/commit/948925143aef367d27547ad4c8bf4264d1b5b626))
* **ui:** 見た目を CSS で決められるカレンダー（Calendar）と日付の入力欄（DateInput）を追加する ([3c9996f](https://github.com/yk-higuchi/home-expense-frontend/commit/3c9996f66a414fb7afbc58a7029fb37a442c94c8))
* **ui:** 部品の対応（Figma とコード）を Git で持ち、lint で照合する ([4884be4](https://github.com/yk-higuchi/home-expense-frontend/commit/4884be40482a389ca5a136490fc3f33671942914))
* 支出・収入のフォームの日付欄を DateInput にする ([96cedc0](https://github.com/yk-higuchi/home-expense-frontend/commit/96cedc086c13bf96a6f4086ab3458337783e3151))


### Bug Fixes

* **ui:** 表を横にスクロールするとき、スクロールバーが下のページネーションと重ならないようにする ([f7621ed](https://github.com/yk-higuchi/home-expense-frontend/commit/f7621ed453799ac67577f65935e104b7bc10397c))

## [1.1.2](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.1.1...v1.1.2) (2026-11-19)


### Bug Fixes

* **ui:** 支出の多い順（BarList）の読み上げ用の文字を、スクロールする領域の中に収める ([225eec9](https://github.com/yk-higuchi/home-expense-frontend/commit/225eec9977c42c0f906af2e3858f1d000f32a3a1))
* **ui:** 本文の枠とグラフを、読み上げ用の文字の位置の基準にする ([4ec42cf](https://github.com/yk-higuchi/home-expense-frontend/commit/4ec42cf3f0ed18416c1ec1de743dd028d7b0538a))

## [1.1.1](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.1.0...v1.1.1) (2026-11-17)


### Bug Fixes

* **ci:** 昇格したタグが index になっても、テスト済みのイメージを指しているかで検証する ([1298add](https://github.com/yk-higuchi/home-expense-frontend/commit/1298add84a0782ae01ea35cafcb5444ea7cd6e41))
* **ci:** 昇格したタグの digest の検証をやめ、元のイメージの digest を記録するだけにする ([cc32225](https://github.com/yk-higuchi/home-expense-frontend/commit/cc32225fd8597a2a6017c6f842345c904b55e237))
* **ci:** 昇格したタグの digest の検証をやめる ([a9aa140](https://github.com/yk-higuchi/home-expense-frontend/commit/a9aa140d5b9ab54380efe0ac0dcc75183a29ab76))

## [1.1.0](https://github.com/yk-higuchi/home-expense-frontend/compare/v1.0.0...v1.1.0) (2026-11-16)


### Features

* UI 部品ライブラリの分離、Figma への準拠、バックエンド 2.1.0 への対応、RSC 化とアクセシビリティの改善 ([902f92a](https://github.com/yk-higuchi/home-expense-frontend/commit/902f92a0be30eb17c7d3bd5897c6adcc95b9cc71))
* **ui:** tokens.css と Figma の定義のずれを lint で検出する ([729a6d6](https://github.com/yk-higuchi/home-expense-frontend/commit/729a6d69e584d13c2f98272d328a2313dd539dc0))
* **ui:** useSortableList の onReorder に動かす前・後の位置を渡す ([d88255a](https://github.com/yk-higuchi/home-expense-frontend/commit/d88255a39bc3d9843e2f186072bf66dd395cfda1))
* **ui:** エラーメッセージ（ErrorMessage）と送信ボタン（SubmitButton）を追加する ([2b11a40](https://github.com/yk-higuchi/home-expense-frontend/commit/2b11a40557041212872bf65063b80d4a594f0cc0))
* **ui:** サイドバーとナビバーを追加し、画面の枠を Figma に合わせる ([f2c3fe9](https://github.com/yk-higuchi/home-expense-frontend/commit/f2c3fe9fd975dcd47975ea556f479365e8d45595))
* **ui:** ダイアログを追加し、削除確認を置き換える ([be985c5](https://github.com/yk-higuchi/home-expense-frontend/commit/be985c56a5afbfdcfb2db095fc07aa42e03222ba))
* **ui:** トースト（Toast）を Popover API で出す部品として追加する ([4505787](https://github.com/yk-higuchi/home-expense-frontend/commit/45057872331ecebe882c802553ed80b57b255b0b))
* **ui:** トーストにエラーの種類（赤）を追加する ([89edb38](https://github.com/yk-higuchi/home-expense-frontend/commit/89edb38e9dad768e2ef86c6f951d2548c4649e9e))
* **ui:** ページネーションを追加し、表の枠の中に置く ([e888a35](https://github.com/yk-higuchi/home-expense-frontend/commit/e888a35d4c119483e0a53dfb2dae712bebf4294b))
* **ui:** ボタンに種類と状態を追加する ([d009e30](https://github.com/yk-higuchi/home-expense-frontend/commit/d009e30a580dba7bdff115e9a94f1b92c1b22da0))
* **ui:** ボタンの見た目のリンクとリンクで描くページ送りを追加し、Select・TextInput をサーバーでも使えるようにする ([a8c8ada](https://github.com/yk-higuchi/home-expense-frontend/commit/a8c8ada3877d1b0a601b312a4e180431f10d9791))
* **ui:** ライブラリなしで行を並べ替える useSortableList と部品を追加する ([cf2fd08](https://github.com/yk-higuchi/home-expense-frontend/commit/cf2fd0852d7db65e68256b7b1b6fd19a077257be))
* **ui:** リセット CSS をレイヤーに入れ、iOS の文字の拡大・自動の空き・フォーム部品の余白を揃える ([1a0c2fa](https://github.com/yk-higuchi/home-expense-frontend/commit/1a0c2fa534b0e146ff32818a25cb0112181eea71))
* **ui:** 一覧画面の絞り込みと追加ボタンをライブラリの部品に置き換える ([230b60e](https://github.com/yk-higuchi/home-expense-frontend/commit/230b60ef073c202f19568176033ffb8bc30ea053))
* **ui:** 保存・削除の知らせを出す StatusMessage を追加する ([709a8b4](https://github.com/yk-higuchi/home-expense-frontend/commit/709a8b47922929afa35437f7019dfced63c3ba3b))
* **ui:** 最小限のリセット CSS を追加し、文字の描き方を Figma に合わせる ([177991c](https://github.com/yk-higuchi/home-expense-frontend/commit/177991cb99fca92de7a9aff645aadf94597b696f))
* **ui:** 押す対象を WCAG 2.2 に合わせて大きくする ([fe6595b](https://github.com/yk-higuchi/home-expense-frontend/commit/fe6595b343d864f9b25b42ba0ead7937fd3ad29f))
* **ui:** 操作できる部品のインタラクションを統一する ([28f0662](https://github.com/yk-higuchi/home-expense-frontend/commit/28f0662078489f38f413a0e2b540e78967648d1f))
* **ui:** 支出の多い順の棒を、固定費は紺、変動費は水色で塗り分ける ([9a23aa9](https://github.com/yk-higuchi/home-expense-frontend/commit/9a23aa987ba9848da35475b1f84c73ff90a035c5))
* **ui:** 文字・入力欄の色、表、ページ送り、ナビゲーションを WCAG 2.2 AA に合わせて直す ([b5b5b94](https://github.com/yk-higuchi/home-expense-frontend/commit/b5b5b947cc1d020774f62645733d23f18033e2b6))
* **ui:** 棒と線を重ねられるグラフの部品を追加する ([ef5163a](https://github.com/yk-higuchi/home-expense-frontend/commit/ef5163a2d471ab056dbf061bc9b0e150269669ce))
* **ui:** 経費・収入・収入属性のフォームをライブラリの部品で作り直す ([5a56f29](https://github.com/yk-higuchi/home-expense-frontend/commit/5a56f29e60d6c6ca71e8a932526c3bcb4fcbd25b))
* **ui:** 表の部品を追加し、アプリの 4 つの表を置き換える ([d9cc12c](https://github.com/yk-higuchi/home-expense-frontend/commit/d9cc12c1533bb8f8ff974d6cce9de7bce05c42f5))
* **ui:** 読み込み中の帯・読み込みエラーの部品と、入力欄・ボタンの読み込み中の見た目を追加する ([899846e](https://github.com/yk-higuchi/home-expense-frontend/commit/899846ed31922f47bbba7332165d4a8f36d47012))
* **ui:** 集計の部品で HOME を作り直す ([f7aa379](https://github.com/yk-higuchi/home-expense-frontend/commit/f7aa379fb28bd4cd3aaddc5ed20132532d27da02))
* useActionState でフォームの入力エラーを表示する ([1f45450](https://github.com/yk-higuchi/home-expense-frontend/commit/1f454501f3ee07406554055229bb4785723b2349))
* useOptimistic で削除をすぐ画面に反映する ([1d97d25](https://github.com/yk-higuchi/home-expense-frontend/commit/1d97d252332a3f1980bbca84057658c13cbee65b))
* useTransition で絞り込み・ページ送りの切り替え中を表示する ([e63b827](https://github.com/yk-higuchi/home-expense-frontend/commit/e63b8272cb9d86149dbcb31fe0aeeb2e4ef56cf6))
* アプリの名前を「家庭用」から「家計簿」にする ([373eb91](https://github.com/yk-higuchi/home-expense-frontend/commit/373eb9106468352ef07589d4a88b69a85054fb65))
* バックエンドとの通信の検査を JTD から JSON Schema 2020-12 に切り替える ([50a6705](https://github.com/yk-higuchi/home-expense-frontend/commit/50a670508665c5cce86b8c0332f573128be5b609))
* バックエンドの楽観的ロックとエラー形式の変更に対応する ([29838e8](https://github.com/yk-higuchi/home-expense-frontend/commit/29838e84671e91c005d660dc119da2e6595884dd))
* 一覧の削除・並べ替えの失敗をトーストで表示し、表の上のエラーをなくす ([3e98b76](https://github.com/yk-higuchi/home-expense-frontend/commit/3e98b760ed7f28564ff51180c11c776497db96c5))
* 保存・削除のあとに、明細のあるページに戻り知らせを出す ([0e45a8e](https://github.com/yk-higuchi/home-expense-frontend/commit/0e45a8ed40174dcf1f6ef10c510481f4f5e00b23))
* 保存・削除の知らせをトーストで表示する ([a3a3480](https://github.com/yk-higuchi/home-expense-frontend/commit/a3a348085d5466a76d4928deaccd5e700c2bdabc))
* 収支の推移グラフを HOME と年間レポートに置く ([273b724](https://github.com/yk-higuchi/home-expense-frontend/commit/273b7243f40a47b7429e69548269472417be95d5))
* 属性の並べ替えと、削除の確認での個別取得に対応する ([20b2a42](https://github.com/yk-higuchi/home-expense-frontend/commit/20b2a42d40ef823ace3c5923202261cc9413d101))
* 年月の選択を HOME でも経費一覧と同じ「年」「月」のプルダウンにする ([b579f34](https://github.com/yk-higuchi/home-expense-frontend/commit/b579f346b89ec243b79301e15eef686514cd6acf))
* 支出と収入の一覧を日付から始め、金額を右端に置く ([cd808d6](https://github.com/yk-higuchi/home-expense-frontend/commit/cd808d640a6848c12601b14e466016246eb34c8d))
* 支出の多い順の棒グラフを HOME の右側に置く ([91ec38f](https://github.com/yk-higuchi/home-expense-frontend/commit/91ec38f6e668c35d93fedc2ff57d3cb6a7c259a2))
* 本文へ移動のリンク・ページの見出し・狭い画面のメニューを追加する ([911ef8c](https://github.com/yk-higuchi/home-expense-frontend/commit/911ef8c6a234b84c7e174250933652b625edf145))
* 画面の「経費」を「支出」に変え、並べ替えの 409 を競合として扱う ([85902f6](https://github.com/yk-higuchi/home-expense-frontend/commit/85902f6671389f17871fa4f96376a2d15a7355f7))
* 画面の部品をライブラリに分離し、依存パッケージを最新化 ([97311ed](https://github.com/yk-higuchi/home-expense-frontend/commit/97311edb0c149d6b6d0b90cfbab8832b7e612a5a))
* 画面全体の幅を最大 1440px にし、広い画面では中央に置く ([cb86de1](https://github.com/yk-higuchi/home-expense-frontend/commit/cb86de12ebe67c38dd0b7d479e25ed656cf1453f))
* 読み込み中は画面の枠を出し、読み込めないときは枠の中にエラーを出す ([54aca24](https://github.com/yk-higuchi/home-expense-frontend/commit/54aca24fa157d843b59c216dfe79dca2e7d880b0))


### Bug Fixes

* 「収入 − 支出」の表記を「収支合計」（表の列は「収支」）に変える ([3e16262](https://github.com/yk-higuchi/home-expense-frontend/commit/3e16262b33a7d7c302c4e07b68c4d1f3ad93d50d))
* **ui:** トーストの閉じるボタンをマウスでは 24px、指の操作では 44px にする ([d72adb6](https://github.com/yk-higuchi/home-expense-frontend/commit/d72adb6859e88c14220dffe76ba880d7fae98da4))
* **ui:** ボタンの大きさを Figma に合わせる（高さ 40px・最小幅 120px） ([d8d01d2](https://github.com/yk-higuchi/home-expense-frontend/commit/d8d01d2ad0371d8be25a85dd7d657ec128cce092))
* **ui:** 並べ替えのドラッグが解除されなくなることがあるのを直す ([8ea91a0](https://github.com/yk-higuchi/home-expense-frontend/commit/8ea91a0bd2d5b18363ba37b78cd209a80f2902ab))
* **ui:** 内訳の金額の右端を HOME の合計にそろえる ([97227ef](https://github.com/yk-higuchi/home-expense-frontend/commit/97227ef7bdf91369c8e7d6d033459393df0a101d))
* **ui:** 行の高さを Figma と同じ整数の px にする ([ac74f21](https://github.com/yk-higuchi/home-expense-frontend/commit/ac74f21f0687a77068add978acd33739cee3216e))
* **ui:** 金額のマイナスの記号を￥のあとに置き、￥の位置をそろえる ([5b16510](https://github.com/yk-higuchi/home-expense-frontend/commit/5b165103a7832d342fbe197435b5e862a83ea323))
* **ui:** 金額を「1,234円」と書き、右寄せにして桁をそろえる ([9b29c62](https://github.com/yk-higuchi/home-expense-frontend/commit/9b29c62948e76cc2ae684aba50723cf7fe1ee5e3))
* デザイン（Figma）との差を直す（ページ送りの高さ・メニューのボタンの位置・読み込み中の帯の幅） ([1de795a](https://github.com/yk-higuchi/home-expense-frontend/commit/1de795af25fce467ee331b4265f225b5d84b21d2))
* デザイン（Figma）との差分を直す（サイドバーの項目の高さ・フォームの余白・無効の項目の色） ([c9f7747](https://github.com/yk-higuchi/home-expense-frontend/commit/c9f7747f225d29b5259c980a8181e96de911c9fe))
* バックエンドの version 追加と削除の If-Match 必須化に対応する ([a333197](https://github.com/yk-higuchi/home-expense-frontend/commit/a3331971bd243b19c58a6413c2dbe8a21b381f6b))
* バックエンドの仕様の厳格化に合わせる ([db47af3](https://github.com/yk-higuchi/home-expense-frontend/commit/db47af3e4d4cb3b5a7677151726b4481da2b96ba))
* フォントの CSS 変数を定義し、絞り込みの幅のクラスを用途の名前にする ([1cd18a1](https://github.com/yk-higuchi/home-expense-frontend/commit/1cd18a1ae925b20a47fee509787c63d9f6a0a0a4))
* メインコンテンツの背景を Figma と同じ 基本/面（白）にする ([1f5ff87](https://github.com/yk-higuchi/home-expense-frontend/commit/1f5ff879bd3d43380777bab6a9e041188a7967df))
* 一覧の番号の列の見出しを「No.」にそろえる ([32ae2de](https://github.com/yk-higuchi/home-expense-frontend/commit/32ae2dea18108ed8e4a66c6a95fe65e1f8b5d24f))
* 利用者の指摘をもとに一覧・年間レポート・読み込み中の表示を直す ([8235f03](https://github.com/yk-higuchi/home-expense-frontend/commit/8235f032f357f10866ae711c173e9a98cd81eadc))
* 削除で version がないときも削除用の文言を出す ([0137140](https://github.com/yk-higuchi/home-expense-frontend/commit/01371406579a8ed155f4a3368153114ada9ab8c7))
* 収入のフォームの日付の項目名を「受取日」にする ([7f3b69b](https://github.com/yk-higuchi/home-expense-frontend/commit/7f3b69b4ebd527e51e0410bb102162a5e662433a))
* 収入の登録画面をリクエストのときに描画する ([7207c27](https://github.com/yk-higuchi/home-expense-frontend/commit/7207c27f537ab386680e3d20922298b5bfd25cbd))
* 経費の金額の項目名を API に合わせて amount にそろえる ([ee23cc4](https://github.com/yk-higuchi/home-expense-frontend/commit/ee23cc470059c0e87d6f0a82171fc71e0fe080c9))
* 絞り込みの年の選択をそろえ、画面の表示と取得条件のずれを直す ([5f04d63](https://github.com/yk-higuchi/home-expense-frontend/commit/5f04d6324ee78cdfd6e099b1116f3175e58a2703))
* 絞り込みの間隔を横並びの間にし、追加ボタンを全一覧で絞り込みと同じ行に置く ([6de59e5](https://github.com/yk-higuchi/home-expense-frontend/commit/6de59e545c004b67f8f74b7916f6d39378c66c1e))


### Reverts

* 支出と収入の一覧の列の並びを元に戻す ([4c41153](https://github.com/yk-higuchi/home-expense-frontend/commit/4c41153f90f02607abe16f6a4e95f371e23bbeaf))
