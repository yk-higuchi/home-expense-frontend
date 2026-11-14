"use client";

import { Button } from "@home-expense/ui";
import type { ReactElement } from "react";

import style from "./error.module.css";

/** エラー画面（Figma: 共通の状態 / エラー） */
const ErrorPage = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): ReactElement => {
  console.error(error);
  return (
    <div className={style.error} role="alert">
      <p className={style.message}>予期せぬエラーが発生しました</p>
      <Button variant="secondary" onClick={() => reset()}>
        もう一度試す
      </Button>
    </div>
  );
};
export default ErrorPage;
