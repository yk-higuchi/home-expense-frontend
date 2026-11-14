import type { ReactElement } from "react";

import styles from "./NavBar.module.css";

export interface NavBarProps {
  /** バーの中央に出すタイトル */
  title: string;
}

/**
 * ナビバー（画面上部のタイトルバー）
 *
 * Figma: コンポーネント / ナビバー
 */
export const NavBar = ({ title }: NavBarProps): ReactElement => (
  <header className={styles.navBar}>
    <p className={styles.title}>{title}</p>
  </header>
);
