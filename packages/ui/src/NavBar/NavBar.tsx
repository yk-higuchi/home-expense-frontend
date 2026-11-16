import type { ReactElement, ReactNode } from "react";

import styles from "./NavBar.module.css";

export interface NavBarProps {
  title: string;
  start?: ReactNode;
}

export const NavBar = ({ title, start }: NavBarProps): ReactElement => (
  <header className={styles.navBar}>
    {start && <div className={styles.start}>{start}</div>}
    <p className={styles.title}>{title}</p>
  </header>
);
