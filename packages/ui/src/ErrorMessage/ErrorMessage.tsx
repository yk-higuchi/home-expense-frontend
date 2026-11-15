import type { ReactElement, ReactNode } from "react";

import styles from "./ErrorMessage.module.css";

export interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

/**
 * 画面の中のエラー（保存・削除の失敗など）。読み上げのため role="alert" を付ける。
 * 入力欄ごとのエラーは TextInput・Select の errorMessage を使う
 *
 * Figma: コンポーネント / エラーメッセージ
 */
export const ErrorMessage = ({
  children,
  className,
}: ErrorMessageProps): ReactElement => (
  <p
    className={[styles.errorMessage, className].filter(Boolean).join(" ")}
    role="alert"
  >
    {children}
  </p>
);
