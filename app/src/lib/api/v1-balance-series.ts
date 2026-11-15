import * as process from "node:process";

import { BalanceSeriesResponse } from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

const getResponse = BalanceSeriesResponse;

type GetResponse = JTD<typeof getResponse>;
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
      return await response.body<GetResponse>(getResponse);
    case "failure":
      throw response.error;
  }
};

export const balanceSeriesApi = {
  get: _get,
};
