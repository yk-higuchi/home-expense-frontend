import type { ComponentType, ReactElement, ReactNode } from "react";

import styles from "./SideBar.module.css";

/** リンク部品が受け取る props（Next の Link や <a> をそのまま渡せる形） */
export interface SideBarLinkProps {
  href: string;
  className?: string;
  "aria-current"?: "page";
  children: ReactNode;
}

export interface SideBarItem {
  label: string;
  href: string;
  /** 表示中の画面に対応する項目なら true */
  active?: boolean;
}

export interface SideBarProps {
  items: SideBarItem[];
  /** 項目に使うリンク部品。省略すると <a> */
  linkComponent?: ComponentType<SideBarLinkProps>;
  /** ナビゲーションの名前（スクリーンリーダー向け） */
  "aria-label"?: string;
}

const Anchor = ({ children, ...props }: SideBarLinkProps): ReactElement => (
  <a {...props}>{children}</a>
);

/**
 * サイドバー（メニュー）
 *
 * Figma: コンポーネント / サイドバー・ナビ項目（SDS Navigation Pill ベース）
 */
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
