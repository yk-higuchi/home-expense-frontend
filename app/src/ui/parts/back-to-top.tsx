"use client";

import { ChevronUpIcon } from "@home-expense/ui";
import { type ReactElement, useEffect, useState } from "react";
import style from "@/ui/parts/back-to-top.module.css";

const BackToTop = (): ReactElement | null => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting),
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  if (!visible) return null;
  const handleClick = (): void => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };
  return (
    <button
      type="button"
      className={style.button}
      aria-label="ページの先頭へ"
      title="ページの先頭へ"
      onClick={handleClick}
    >
      <ChevronUpIcon size={20} />
    </button>
  );
};
export default BackToTop;
