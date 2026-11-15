import * as process from "node:process";

import { BalanceSeriesResponse } from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

// スキーマは、バックエンドが OpenAPI から生成したもの（src/lib/api/generated/jtd.ts。pnpm gen:api で作り直す）
// 金額は int64（最大 1 兆）。JTD に int64 がないため float64 になっている
const getResponse = BalanceSeriesResponse;

type GetResponse = JTD<typeof getResponse>;
/** 集計の粒度（day・week・month・quarter・year） */
type Granularity = GetResponse["granularity"];

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
