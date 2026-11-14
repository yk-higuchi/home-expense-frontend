"use client";

import { type InputHTMLAttributes, type ReactElement, useId } from "react";

import { controlClassName, describedBy, Field } from "../Field/Field";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 入力欄の上に出すラベル */
  label: string;
  /** ラベルの下に出す補足 */
  description?: string;
  /** 入力エラーのメッセージ。指定するとエラー表示になる */
  errorMessage?: string;
}

/**
 * テキスト入力
 *
 * Figma: コンポーネント / テキスト入力（SDS Input Field ベース）
 */
export const TextInput = ({
  label,
  description,
  errorMessage,
  id,
  className,
  type = "text",
  ...rest
}: TextInputProps): ReactElement => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field
      id={inputId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <input
        id={inputId}
        type={type}
        className={controlClassName}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy(inputId, description, errorMessage)}
        {...rest}
      />
    </Field>
  );
};
