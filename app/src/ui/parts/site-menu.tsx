"use client";

import { MenuIcon } from "@home-expense/ui";
import {
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import style from "@/ui/parts/site-menu.module.css";
import { MENU_COLLAPSED, MENU_COOKIE } from "@/ui/parts/site-menu-cookie";

const MENU_ID = "site-menu";
const ONE_YEAR = 60 * 60 * 24 * 365;

const MenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

const saveCollapsed = (collapsed: boolean): void => {
  const store = globalThis.cookieStore;
  if (store === undefined) return;
  const saving = collapsed
    ? store.set({
        name: MENU_COOKIE,
        value: MENU_COLLAPSED,
        path: "/",
        expires: Date.now() + ONE_YEAR * 1000,
        sameSite: "lax",
      })
    : store.delete({ name: MENU_COOKIE, path: "/" });
  saving.catch(() => {});
};

export const SiteMenuProvider = ({
  initialCollapsed,
  children,
}: {
  initialCollapsed: boolean;
  children: ReactNode;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(initialCollapsed);
  const setCollapsed = (next: boolean): void => {
    setCollapsedState(next);
    saveCollapsed(next);
  };
  return (
    <MenuContext value={{ open, setOpen, collapsed, setCollapsed }}>
      {children}
    </MenuContext>
  );
};

export const SiteMenuButton = (): ReactElement => {
  const { open, setOpen, collapsed, setCollapsed } = useContext(MenuContext);
  return (
    <>
      <button
        type="button"
        className={[style.button, style.mobile].join(" ")}
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen(!open)}
      >
        <MenuIcon size={20} />
        <span className={style.label}>メニュー</span>
      </button>
      <button
        type="button"
        className={[style.button, style.desktop].join(" ")}
        aria-expanded={!collapsed}
        aria-controls={MENU_ID}
        onClick={() => setCollapsed(!collapsed)}
      >
        <MenuIcon size={20} />
        <span className={style.label}>メニュー</span>
      </button>
    </>
  );
};

export const SiteMenu = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => {
  const { open, setOpen, collapsed } = useContext(MenuContext);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const isToggle = (target: EventTarget | null): boolean =>
      target instanceof Element &&
      target.closest(`[aria-controls="${MENU_ID}"]`) !== null;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      setOpen(false);
      const toggle = [
        ...document.querySelectorAll<HTMLElement>(
          `[aria-controls="${MENU_ID}"]`,
        ),
      ].find((element) => element.getClientRects().length > 0);
      toggle?.focus();
    };
    const handlePointerDown = (event: PointerEvent): void => {
      if (
        event.target instanceof Node &&
        !ref.current?.contains(event.target) &&
        !isToggle(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, setOpen]);
  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target instanceof Element && event.target.closest("a"))
      setOpen(false);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: メニューの中のリンクを押したらメニューを閉じるだけで、この要素自体は操作の対象ではない
    // biome-ignore lint/a11y/useKeyWithClickEvents: リンクは Enter でも click が発生するため、キーボードの処理は要らない
    <div
      id={MENU_ID}
      ref={ref}
      className={[
        className,
        style.menu,
        open && style.open,
        collapsed && style.collapsed,
      ]
        .filter(Boolean)
        .join(" ")}
      data-collapsed={collapsed || undefined}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
