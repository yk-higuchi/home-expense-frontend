import * as process from "node:process";

import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

export type Granularity = "day" | "week" | "month" | "quarter" | "year";

// 金額は int64（最大 1 兆）。JTD に int64 がないため float64 で受ける
const getResponse = {
  properties: {
    granularity: { enum: ["day", "week", "month", "quarter", "year"] },
    items: {
      elements: {
        properties: {
          period: {
            properties: {
              from: { type: "string" },
              to: { type: "string" },
            },
          },
          income_total: { type: "float64" },
          fixed_expense_total: { type: "float64" },
          variable_expense_total: { type: "float64" },
          expense_total: { type: "float64" },
          net: { type: "float64" },
        },
      },
    },
  },
} as const;

type GetResponse = JTD<typeof getResponse>;

/** 期間内の収入・支出・収支の推移（データのない期間も 0 で返る） */
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
