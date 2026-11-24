import { type ReactElement, useEffect, useId, useRef, useState } from "react";

import { MoreIcon } from "../icons/icons";
import styles from "./ActionMenu.module.css";

export interface ActionMenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "danger";
}

export interface ActionMenuProps {
  label: string;
  items: readonly ActionMenuItem[];
  className?: string;
}

const GAP = 4;

const placeMenu = (menu: HTMLElement, anchor: HTMLElement): void => {
  const rect = anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = menu;
  const below = rect.bottom + GAP;
  const above = rect.top - GAP - height;
  const preferred =
    below + height <= window.innerHeight || above < 0 ? below : above;
  menu.style.top = `${Math.max(GAP, Math.min(preferred, window.innerHeight - height - GAP))}px`;
  menu.style.left = `${Math.max(GAP, Math.min(rect.right - width, window.innerWidth - width - GAP))}px`;
};

export const ActionMenu = ({
  label,
  items,
  className,
}: ActionMenuProps): ReactElement => {
  const menuId = `${useId()}-menu`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!menu || !button) return;
    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === "open";
      if (opened) placeMenu(menu, button);
      setOpen(opened);
    };
    const onResize = () => menu.hidePopover();
    menu.addEventListener("toggle", onToggle);
    window.addEventListener("resize", onResize);
    return () => {
      menu.removeEventListener("toggle", onToggle);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={menuId}
        popoverTarget={menuId}
      >
        <MoreIcon size={20} />
      </button>
      <div ref={menuRef} id={menuId} popover="auto" className={styles.menu}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={[styles.item, item.tone === "danger" && styles.danger]
              .filter(Boolean)
              .join(" ")}
            disabled={item.disabled}
            onClick={() => {
              menuRef.current?.hidePopover();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
