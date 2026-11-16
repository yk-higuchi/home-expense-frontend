"use client";

import { Button, LoadError } from "@home-expense/ui";
import type { ReactElement } from "react";
import { PageHeading } from "@/ui/parts/page-heading";

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
    <div className={style.state}>
      <PageHeading>エラー</PageHeading>
      <LoadError
        message="予期せぬエラーが発生しました"
        action={<Button onClick={() => reset()}>もう一度試す</Button>}
      />
    </div>
  );
};
export default ErrorPage;
