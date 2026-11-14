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

export const parseLinkHeader = (
  headers: Record<string, string>,
): Pagination => {
  const { link } = headers;
  console.log(link);
  return link.split(",").reduce<Pagination>(
    (previousValue, currentValue) => {
      console.log(currentValue);
      const _array = currentValue.split(";");
      console.log(_array);
      const urlValue = _array[0].trim().replace("<", "").replace(">", "");
      console.log(urlValue);
      const url = new URL(urlValue);
      const page = url.searchParams.get("page");
      const perPage = url.searchParams.get("per_page");
      const rel = _array[1].trim().split("=")[1].replaceAll('"', "");
      if (page != null && perPage != null) {
        return Object.assign(previousValue, {
          [rel]: {
            page: parseInt(page, 10),
            perPage: parseInt(perPage, 10),
          },
        });
      }
      // TODO
      throw Error("");
    },
    {
      first: { page: 0, perPage: 0 },
      current: { page: 0, perPage: 0 },
      last: { page: 0, perPage: 0 },
    },
  );
};
