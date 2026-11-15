import * as process from "node:process";

import {
  IncomeGetResponse,
  IncomeListResponse,
  IncomePostRequest,
  IncomePutRequest,
} from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";
import { type Pagination, parseLinkHeader } from "@/lib/pagination/pagination";

// スキーマは、バックエンドが OpenAPI から生成したもの（src/lib/api/generated/jtd.ts。pnpm gen:api で作り直す）
const getSummaryResponse = IncomeListResponse;
const getResponse = IncomeGetResponse;
const postRequest = IncomePostRequest;
const putRequest = IncomePutRequest;

type GetSummaryResponse = JTD<typeof getSummaryResponse>;
type GetResponse = JTD<typeof getResponse>;
type PostRequest = JTD<typeof postRequest>;
type PutRequest = JTD<typeof putRequest>;

const _getSummary = async ({
  page,
  perPage,
  year,
  extension,
}: {
  page: number;
  perPage: number;
  year: number;
  extension: object;
}): Promise<{ pagination: Pagination; response: GetSummaryResponse }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/incomes",
    queries: {
      page: page.toString(),
      per_page: perPage.toString(),
      year: year.toString(),
    },
    extension,
  });
  switch (response.type) {
    case "success": {
      const { headers } = response;
      if (headers) {
        const pagination = parseLinkHeader(headers);
        const responseBody =
          await response.body<GetSummaryResponse>(getSummaryResponse);
        return {
          pagination,
          response: responseBody,
        };
      }

      throw new Error("");
    }
    case "failure":
      throw response.error;
  }
};

const _get = async ({
  id,
  extension,
}: {
  id: string;
  extension: object;
}): Promise<GetResponse & { etag?: string }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: `/v1/incomes/${id}`,
    extension,
  });
  switch (response.type) {
    case "success":
      // ETag はデータのバージョン。更新（PUT）の If-Match にそのまま使う
      return {
        ...(await response.body<GetResponse>(getResponse)),
        etag: response.headers?.etag,
      };
    case "failure":
      throw response.error;
  }
};

const _post = async ({
  description,
  attribute_id,
  amount,
  receive_date,
}: PostRequest): Promise<void> => {
  const data = {
    description,
    attribute_id,
    amount,
    receive_date,
  };
  const response = await http.post({
    url: process.env.BACKEND_URL,
    path: "/v1/incomes",
    requestBody: {
      schema: postRequest,
      data,
    },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

const _put = async ({
  id,
  description,
  attribute_id,
  amount,
  receive_date,
  ifMatch,
}: {
  id: string;
  /** 取得時の ETag（楽観的ロック） */
  ifMatch: string;
} & PutRequest): Promise<void> => {
  const data = {
    description,
    attribute_id,
    amount,
    receive_date,
  };
  const response = await http.put({
    url: process.env.BACKEND_URL,
    path: `/v1/incomes/${id}`,
    headers: { "if-match": ifMatch },
    requestBody: {
      schema: putRequest,
      data,
    },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

const _delete = async ({
  id,
  ifMatch,
}: {
  id: string;
  /** 一覧で表示したときのバージョン（楽観的ロック） */
  ifMatch: string;
}): Promise<void> => {
  const response = await http.delete({
    url: process.env.BACKEND_URL,
    path: `/v1/incomes/${id}`,
    headers: { "if-match": ifMatch },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

export const incomesApi = {
  get: _get,
  getSummary: _getSummary,
  post: _post,
  put: _put,
  delete: _delete,
};
