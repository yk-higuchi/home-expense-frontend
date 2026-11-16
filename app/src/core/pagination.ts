interface PagePosition {
  page: number;
  perPage: number;
}

export interface Pagination {
  current: PagePosition;
  first: PagePosition;
  last: PagePosition;
  next?: PagePosition;
  previous?: PagePosition;
}
