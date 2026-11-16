import { Pagination as PaginationNav } from "@home-expense/ui";
import type { ReactElement } from "react";
import { LIST_LINK } from "@/lib/list-link";
import type { Pagination } from "@/lib/pagination/pagination";

interface Props {
  pagination: Pagination;
  path: string;
  query: Record<string, string>;
}

const PaginationComponent = ({
  pagination,
  path,
  query,
}: Props): ReactElement => {
  const { current, last } = pagination;
  return (
    <PaginationNav
      currentPage={current.page}
      totalPages={Math.max(last.page, current.page, 1)}
      hrefFor={(page) =>
        `${path}?${new URLSearchParams({
          ...query,
          page: String(page),
          per_page: String(current.perPage),
        })}`
      }
      linkAttributes={LIST_LINK}
    />
  );
};
export default PaginationComponent;
