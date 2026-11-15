import type { ComponentType, ReactElement, ReactNode } from "react";

import styles from "./SideBar.module.css";

export interface SideBarLinkProps {
  href: string;
  className?: string;
  "aria-current"?: "page";
  children: ReactNode;
}

export interface SideBarItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface SideBarProps {
  items: SideBarItem[];
  linkComponent?: ComponentType<SideBarLinkProps>;
  "aria-label"?: string;
}

const Anchor = ({ children, ...props }: SideBarLinkProps): ReactElement => (
  <a {...props}>{children}</a>
);

export const SideBar = ({
  items,
  linkComponent: Link = Anchor,
  "aria-label": ariaLabel = "メインメニュー",
}: SideBarProps): ReactElement => (
  <nav className={styles.sideBar} aria-label={ariaLabel}>
    <ul className={styles.list}>
      {items.map(({ label, href, active }) => (
        <li key={href}>
          <Link
            href={href}
            className={[styles.item, active && styles.active]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
