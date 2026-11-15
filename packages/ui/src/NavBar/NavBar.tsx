import type { ReactElement } from "react";

import styles from "./NavBar.module.css";

export interface NavBarProps {
  title: string;
}

export const NavBar = ({ title }: NavBarProps): ReactElement => (
  <header className={styles.navBar}>
    <p className={styles.title}>{title}</p>
  </header>
);
