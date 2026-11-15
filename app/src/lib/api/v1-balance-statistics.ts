import * as process from "node:process";

import { BalanceStatisticsResponse } from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

// スキーマは、バックエンドが OpenAPI から生成したもの（src/lib/api/generated/jtd.ts。pnpm gen:api で作り直す）
// 金額は int64（最大 1 兆）。JTD に int64 がないため float64 になっている
const getResponse = BalanceStatisticsResponse;

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
