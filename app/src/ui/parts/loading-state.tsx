import { LoaderIcon } from "@home-expense/ui";
import type { ReactElement } from "react";

import style from "@/app/state.module.css";

const LoadingState = (): ReactElement => (
  <div className={style.state} role="status">
    <LoaderIcon size={32} className={style.spinner} />
    <p className={style.message}>読み込み中…</p>
  </div>
);
export default LoadingState;
