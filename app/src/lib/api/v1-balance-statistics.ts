import * as process from "node:process";

import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

// 金額は int64（最大 1 兆）。JTD に int64 がないため float64 で受ける
const breakdown = {
  properties: {
    total: { type: "float64" },
    breakdown: {
      elements: {
        properties: {
          attribute_id: { type: "string" },
          attribute_name: { type: "string" },
          amount: { type: "float64" },
        },
      },
    },
  },
} as const;

const getResponse = {
  properties: {
    period: {
      properties: {
        from: { type: "string" },
        to: { type: "string" },
      },
    },
    income: breakdown,
    fixed_expense: breakdown,
    variable_expense: breakdown,
    expense_total: { type: "float64" },
    net: { type: "float64" },
  },
} as const;

type GetResponse = JTD<typeof getResponse>;

/** 年（month を省略）または月の、収入・支出の合計と属性ごとの内訳 */
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
