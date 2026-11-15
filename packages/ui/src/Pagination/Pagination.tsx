import type { ReactElement } from "react";

import styles from "./Pagination.module.css";

export interface PaginationProps {
  /** 今のページ（1 始まり） */
  currentPage: number;
  /** 全ページ数 */
  totalPages: number;
  /** ページを選んだとき */
  onPageChange: (page: number) => void;
  /** 今のページの前後に表示するページ数 */
  siblingCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  "aria-label"?: string;
}

type Item = number | "gap-start" | "gap-end";

/** 先頭・今のページの前後・最後を並べ、間を省略記号にする */
export const paginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount = 2,
): Item[] => {
  if (totalPages <= 1) return [1];
  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);
  const items: Item[] = [1];
  if (start > 2) items.push("gap-start");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < totalPages - 1) items.push("gap-end");
  items.push(totalPages);
  return items;
};

const Arrow = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {direction === "left" ? (
      <path d="M19 12H5M12 19l-7-7 7-7" />
    ) : (
      <path d="M5 12h14M12 5l7 7-7 7" />
    )}
  </svg>
);

/**
 * ページネーション
 *
 * Figma: コンポーネント / ページネーション
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
  previousLabel = "Previous",
  nextLabel = "Next",
  "aria-label": ariaLabel = "ページ送り",
}: PaginationProps): ReactElement => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <button
        type="button"
        className={styles.step}
        disabled={!hasPrevious}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Arrow direction="left" />
        {previousLabel}
      </button>
      <ul className={styles.list}>
        {paginationItems(currentPage, totalPages, siblingCount).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={styles.page}
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`${item} ページ`}
                onClick={() => item !== currentPage && onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={styles.gap} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className={styles.step}
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {nextLabel}
        <Arrow direction="right" />
      </button>
    </nav>
  );
};
