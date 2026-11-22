"use client";

import { type ReactElement, useEffect, useRef, useState } from "react";

import { CheckIcon, CloseIcon, LoaderIcon, WarningIcon } from "../icons/icons";
import styles from "./Toast.module.css";

export interface ToastNotice {
  id: number;
  text: string;
  tone?: "success" | "error" | "pending";
}

export interface ToastProps {
  notice: ToastNotice | null;
  duration?: number;
}

export const Toast = ({
  notice,
  duration = 5000,
}: ToastProps): ReactElement => {
  const [shown, setShown] = useState<ToastNotice | null>(notice);
  const [from, setFrom] = useState(notice);
  const [paused, setPaused] = useState(false);
  const popover = useRef<HTMLOutputElement>(null);
  if (from !== notice) {
    setFrom(notice);
    setShown(notice);
  }

  useEffect(() => {
    const element = popover.current;
    if (element === null) return;
    const open = element.matches(":popover-open");
    if (shown !== null && !open) element.showPopover();
    if (shown === null && open) element.hidePopover();
  }, [shown]);

  useEffect(() => {
    if (
      shown === null ||
      paused ||
      shown.tone === "error" ||
      shown.tone === "pending"
    )
      return;
    const timer = setTimeout(() => setShown(null), duration);
    return () => clearTimeout(timer);
  }, [shown, paused, duration]);

  return (
    <>
      <p className={styles.srOnly} role="status">
        {shown?.tone !== "error" && shown?.text}
      </p>
      <p className={styles.srOnly} role="alert">
        {shown?.tone === "error" && shown.text}
      </p>
      <output
        ref={popover}
        popover="manual"
        aria-live="off"
        className={[
          styles.toast,
          shown?.tone === "error" && styles.error,
          shown?.tone === "pending" && styles.pending,
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {shown && (
          <>
            {shown.tone === "error" && <WarningIcon size={20} />}
            {shown.tone === "pending" && (
              <LoaderIcon size={20} className={styles.spinner} />
            )}
            {(shown.tone === undefined || shown.tone === "success") && (
              <CheckIcon size={20} />
            )}
            <span className={styles.text}>{shown.text}</span>
            {shown.tone !== "pending" && (
              <button
                type="button"
                className={styles.close}
                onClick={() => setShown(null)}
                aria-label="閉じる"
                title="閉じる"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </>
        )}
      </output>
    </>
  );
};
