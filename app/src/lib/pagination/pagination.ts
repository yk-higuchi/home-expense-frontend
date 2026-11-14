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

/** RFC 8288 の関係名を画面側の名前にする（古いバックエンドの current / previous も受け付ける） */
const REL_NAMES: Record<string, keyof Pagination> = {
  self: "current",
  current: "current",
  first: "first",
  last: "last",
  next: "next",
  prev: "previous",
  previous: "previous",
};

/**
 * Link ヘッダー（RFC 8288）からページ送りの情報を取り出す。
 * 例: <https://api/v1/expenses?page=2&per_page=10>; rel="self", <...>; rel="next"
 */
export const parseLinkHeader = (
  headers: Record<string, string>,
): Pagination => {
  const pagination: Pagination = {
    first: { page: 0, perPage: 0 },
    current: { page: 0, perPage: 0 },
    last: { page: 0, perPage: 0 },
  };
  const { link = "" } = headers;
  // URL の中のカンマで切らないよう、「<URL>; 引数」の単位で取り出す
  for (const [, target, params] of link.matchAll(/<([^>]*)>([^,<]*)/g)) {
    const url = new URL(target ?? "", "http://localhost");
    const page = url.searchParams.get("page");
    const perPage = url.searchParams.get("per_page");
    if (page === null || perPage === null) continue;
    // rel は空白区切りで複数の関係名を持てる（例: rel="self last"）
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
