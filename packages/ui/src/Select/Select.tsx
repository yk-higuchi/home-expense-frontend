"use client";

import { type ComponentPropsWithRef, type ReactElement, useId } from "react";

import { controlClassName, describedBy, Field } from "../Field/Field";
import styles from "./Select.module.css";

export interface SelectProps
  extends Omit<ComponentPropsWithRef<"select">, "size"> {
  /**
   * プルダウンの上に出すラベル。
   * 期間選択のようにラベルを出さない場合は省略し、aria-label を指定する。
   */
  label?: string;
  /** ラベルの下に出す補足 */
  description?: string;
  /** 入力エラーのメッセージ。指定するとエラー表示になる */
  errorMessage?: string;
}

/**
 * プルダウン（選択肢は <option> を children で渡す）
 *
 * Figma: コンポーネント / プルダウン（SDS Select Field ベース）
 */
export const Select = ({
  label,
  description,
  errorMessage,
  id,
  className,
  children,
  ...rest
}: SelectProps): ReactElement => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <Field
      id={selectId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <div className={styles.wrapper}>
        <select
          id={selectId}
          className={[controlClassName, styles.select].join(" ")}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedBy(selectId, description, errorMessage)}
          {...rest}
        >
          {children}
        </select>
        {/* SDS の Chevron down（16px） */}
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Field>
  );
};
