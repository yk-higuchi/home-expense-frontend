"use client";

import type { ReactElement } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "../Button/Button";

export type SubmitButtonProps = Omit<ButtonProps, "type" | "loading">;

/**
 * フォームの送信ボタン。親の <form> が送信中のあいだ、自動で「処理中」になり二度押しを防ぐ（React 19 の useFormStatus）
 *
 * Figma: コンポーネント / ボタン（State=Loading が送信中）
 */
export const SubmitButton = (props: SubmitButtonProps): ReactElement => {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
};
