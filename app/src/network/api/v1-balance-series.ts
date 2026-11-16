import * as process from "node:process";

import { http } from "@/network/http";
import type { Schema } from "@/network/schema/type";

const getResponse = "BalanceSeriesResponse" as const;

type GetResponse = Schema<typeof getResponse>;
type Granularity = GetResponse["granularity"];

const _get = async ({
  from,
  to,
  granularity,
  extension,
}: {
  from: string;
  to: string;
  granularity: Granularity;
  extension: object;
}): Promise<GetResponse> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/balance-series",
    queries: { from, to, granularity },
    extension,
  });
  switch (response.type) {
    case "success":
      return await response.body(getResponse);
    case "failure":
      throw response.error;
  }
};

export const balanceSeriesApi = {
  get: _get,
};
