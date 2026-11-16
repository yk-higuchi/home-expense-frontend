import type { ReactElement, ReactNode } from "react";

import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  hrefFor?: (page: number) => string;
  linkAttributes?: Record<`data-${string}`, string>;
  siblingCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  "aria-label"?: string;
}

type Item = number | "gap-start" | "gap-end";

const paginationItems = (
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

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hrefFor,
  linkAttributes,
  siblingCount = 2,
  previousLabel = "Previous",
  nextLabel = "Next",
  "aria-label": ariaLabel = "ページ送り",
}: PaginationProps): ReactElement => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const step = (
    page: number,
    enabled: boolean,
    content: ReactNode,
    fallbackLabel: string,
    visibleLabel: string,
  ): ReactElement => {
    const body = (
      <>
        {content}
        {!visibleLabel && (
          <span className={styles.srOnly}>{fallbackLabel}</span>
        )}
      </>
    );
    if (!hrefFor) {
      return (
        <button
          type="button"
          className={styles.step}
          disabled={!enabled}
          onClick={() => onPageChange?.(page)}
        >
          {body}
        </button>
      );
    }
    return enabled ? (
      <a className={styles.step} href={hrefFor(page)} {...linkAttributes}>
        {body}
      </a>
    ) : (
      <span className={styles.step} aria-disabled="true">
        {body}
      </span>
    );
  };
  const pageItem = (page: number): ReactElement => {
    const current = page === currentPage;
    return hrefFor ? (
      <a
        className={styles.page}
        href={hrefFor(page)}
        aria-current={current ? "page" : undefined}
        aria-label={`${page} ページ`}
        {...linkAttributes}
      >
        {page}
      </a>
    ) : (
      <button
        type="button"
        className={styles.page}
        aria-current={current ? "page" : undefined}
        aria-label={`${page} ページ`}
        onClick={() => !current && onPageChange?.(page)}
      >
        {page}
      </button>
    );
  };
  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      {step(
        currentPage - 1,
        hasPrevious,
        <>
          <Arrow direction="left" />
          {previousLabel}
        </>,
        "前のページ",
        previousLabel,
      )}
      <ul className={styles.list}>
        {paginationItems(currentPage, totalPages, siblingCount).map((item) =>
          typeof item === "number" ? (
            <li key={item}>{pageItem(item)}</li>
          ) : (
            <li key={item} className={styles.gap} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>
      {step(
        currentPage + 1,
        hasNext,
        <>
          {nextLabel}
          <Arrow direction="right" />
        </>,
        "次のページ",
        nextLabel,
      )}
    </nav>
  );
};
