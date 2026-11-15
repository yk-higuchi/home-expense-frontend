"use client";

import { Button, WarningIcon } from "@home-expense/ui";
import type { ReactElement } from "react";

import style from "./state.module.css";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): ReactElement => {
  console.error(error);
  return (
    <div className={style.state} role="alert">
      <WarningIcon size={32} />
      <p className={style.message}>予期せぬエラーが発生しました</p>
      <Button className={style.retry} onClick={() => reset()}>
        もう一度試す
      </Button>
    </div>
  );
};
export default ErrorPage;
