"use client";

import { MenuIcon } from "@home-expense/ui";
import {
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react";
import style from "@/ui/parts/site-menu.module.css";

const MENU_ID = "site-menu";

const MenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export const SiteMenuProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  return <MenuContext value={{ open, setOpen }}>{children}</MenuContext>;
};

export const SiteMenuButton = (): ReactElement => {
  const { open, setOpen } = useContext(MenuContext);
  return (
    <button
      type="button"
      className={style.button}
      aria-expanded={open}
      aria-controls={MENU_ID}
      onClick={() => setOpen(!open)}
    >
      <MenuIcon size={20} />
      <span className={style.label}>メニュー</span>
    </button>
  );
};

export const SiteMenu = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => {
  const { open, setOpen } = useContext(MenuContext);
  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target instanceof Element && event.target.closest("a"))
      setOpen(false);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: メニューの中のリンクを押したらメニューを閉じるだけで、この要素自体は操作の対象ではない
    // biome-ignore lint/a11y/useKeyWithClickEvents: リンクは Enter でも click が発生するため、キーボードの処理は要らない
    <div
      id={MENU_ID}
      className={[className, style.menu, open && style.open]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
