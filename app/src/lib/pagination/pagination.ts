export interface Pagination {
  current: {
    page: number;
    perPage: number;
  };
  first: {
    page: number;
    perPage: number;
  };
  last: {
    page: number;
    perPage: number;
  };
  next?: {
    page: number;
    perPage: number;
  };
  previous?: {
    page: number;
    perPage: number;
  };
}

const REL_NAMES: Record<string, keyof Pagination> = {
  self: "current",
  current: "current",
  first: "first",
  last: "last",
  next: "next",
  prev: "previous",
  previous: "previous",
};

export const parseLinkHeader = (
  headers: Record<string, string>,
): Pagination => {
  const pagination: Pagination = {
    first: { page: 0, perPage: 0 },
    current: { page: 0, perPage: 0 },
    last: { page: 0, perPage: 0 },
  };
  const { link = "" } = headers;
  for (const [, target, params] of link.matchAll(/<([^>]*)>([^,<]*)/g)) {
    const url = new URL(target ?? "", "http://localhost");
    const page = url.searchParams.get("page");
    const perPage = url.searchParams.get("per_page");
    if (page === null || perPage === null) continue;
    const rels = /rel\s*=\s*"?([^";]+)"?/i.exec(params ?? "")?.[1] ?? "";
    for (const rel of rels.trim().toLowerCase().split(/\s+/)) {
      const key = REL_NAMES[rel];
      if (key) {
        pagination[key] = {
          page: Number.parseInt(page, 10),
          perPage: Number.parseInt(perPage, 10),
        };
      }
    }
  }
  return pagination;
};
