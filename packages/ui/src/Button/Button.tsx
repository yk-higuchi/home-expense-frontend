import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "subtle";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * 種類
   * - primary: 主な操作（登録・更新・追加）
   * - secondary: キャンセルなど
   * - danger: 削除の確定
   * - subtle: 目立たない操作
   */
  variant?: ButtonVariant;
  /** 処理中。回転アイコンを出し、押せなくする（二度押し防止） */
  loading?: boolean;
  /** 親要素の幅いっぱいに広げる */
  fullWidth?: boolean;
  /** ラベルの前に置くアイコン（例: <PlusIcon />）。処理中は回転アイコンに置き換わる */
  icon?: ReactNode;
}

/**
 * ボタン
 *
 * Figma: コンポーネント / ボタン（Variant × State）
 * 状態: ホバーで 1 段濃く、押下でさらに 1 段濃く、フォーカスは 2px の隙間＋2px の線、
 * 無効は SDS の無効色、処理中は回転アイコン
 */
export const Button = ({
  variant = "primary",
  loading = false,
  fullWidth = false,
  icon,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps): ReactElement => {
  const classNames = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {!loading && icon}
      {loading && (
        // SDS の Loader アイコン
        <svg
          className={styles.spinner}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
};
