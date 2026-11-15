import { LoaderIcon } from "@home-expense/ui";
import type { ReactElement } from "react";

import style from "./state.module.css";

/** 読み込み中の画面（Figma: 共通の状態 / 読み込み中） */
const Loading = (): ReactElement => (
  <div className={style.state} role="status">
    <LoaderIcon size={32} className={style.spinner} />
    <p className={style.message}>読み込み中…</p>
  </div>
);
export default Loading;
