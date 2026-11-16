import { Pagination as PaginationNav } from "@home-expense/ui";
import type { ReactElement } from "react";
import type { Pagination } from "@/network/pagination/pagination";
import { LIST_LINK } from "@/ui/parts/list-link";

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
