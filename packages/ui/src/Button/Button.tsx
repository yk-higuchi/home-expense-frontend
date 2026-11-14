import type { ButtonHTMLAttributes, ReactElement } from "react";

import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 親要素の幅いっぱいに広げる */
  fullWidth?: boolean;
}

/**
 * ボタン
 *
 * Figma: コンポーネント / ボタン（SDS Button Neutral を水色系に上書きしたもの）
 */
export const Button = ({
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: ButtonProps): ReactElement => {
  const classNames = [styles.button, fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classNames} {...rest} />;
};
