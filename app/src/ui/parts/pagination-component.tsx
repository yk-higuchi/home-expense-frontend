"use client";

import { Pagination as PaginationNav } from "@home-expense/ui";
import type { ReactElement } from "react";
import type { Pagination } from "@/lib/pagination/pagination";

interface Props {
  pagination: Pagination;
  onMovePrevious: (page: number, perPage: number) => void;
  onMoveNext: (page: number, perPage: number) => void;
  onMovePage: (page: number, perPage: number) => void;
}

const PaginationComponent = ({
  pagination,
  onMovePrevious,
  onMoveNext,
  onMovePage,
}: Props): ReactElement => {
  const { previous, next, current, last } = pagination;
  const handlePageChange = (page: number): void => {
    if (previous && page === previous.page) {
      onMovePrevious(previous.page, previous.perPage);
    } else if (next && page === next.page) {
      onMoveNext(next.page, next.perPage);
    } else {
      onMovePage(page, current.perPage);
    }
  };
  return (
    <PaginationNav
      currentPage={current.page}
      totalPages={Math.max(last.page, current.page, 1)}
      onPageChange={handlePageChange}
    />
  );
};
export default PaginationComponent;
