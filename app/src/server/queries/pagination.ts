import "server-only";
import type { Pagination } from "@/core/pagination";
import type { PageLinks } from "@/network/pagination/pagination";

export const toPagination = ({
  current,
  first,
  last,
  next,
  previous,
}: PageLinks): Pagination => ({ current, first, last, next, previous });
