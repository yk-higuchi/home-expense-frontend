import * as process from "node:process";

import { http } from "@/network/http";
import type { Schema } from "@/network/schema/type";

const getResponse = "BalanceStatisticsResponse" as const;

type GetResponse = Schema<typeof getResponse>;

const _get = async ({
  year,
  month,
  extension,
}: {
  year: number;
  month?: number;
  extension: object;
}): Promise<GetResponse> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/balance-statistics",
    queries: {
      year: year.toString(),
      month: month?.toString(),
    },
    extension,
  });
  switch (response.type) {
    case "success":
      return await response.body(getResponse);
    case "failure":
      throw response.error;
  }
};

export const balanceStatisticsApi = {
  get: _get,
};
