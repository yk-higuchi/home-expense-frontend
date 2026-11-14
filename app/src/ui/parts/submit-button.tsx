"use client";

import { Button, type ButtonProps } from "@home-expense/ui";
import type { ReactElement } from "react";
import { useFormStatus } from "react-dom";

type Props = Omit<ButtonProps, "type" | "loading">;

/** フォームの送信ボタン。送信中は自動で「処理中」になり、二度押しを防ぐ */
const SubmitButton = (props: Props): ReactElement => {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
};
export default SubmitButton;
