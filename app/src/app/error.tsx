"use client";
import type { ReactElement } from "react";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): ReactElement => {
  console.log(error);
  return (
    <div>
      <div>予期せぬエラー</div>
      <button
        type="button"
        onClick={(): void => {
          reset();
        }}
      >
        Try again
      </button>
    </div>
  );
};
export default ErrorPage;
