import * as process from "node:process";

import { BalanceStatisticsResponse } from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

const getResponse = BalanceStatisticsResponse;

type GetResponse = JTD<typeof getResponse>;

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
      return await response.body<GetResponse>(getResponse);
    case "failure":
      throw response.error;
  }
};

export const balanceStatisticsApi = {
  get: _get,
};
