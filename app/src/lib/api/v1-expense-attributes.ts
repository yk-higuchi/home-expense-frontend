import process from "node:process";

import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";
import { type Pagination, parseLinkHeader } from "@/lib/pagination/pagination";

const getSummaryResponse = {
  properties: {
    expense_attributes: {
      elements: {
        properties: {
          id: { type: "string" },
          // データのバージョン（int64。JTD に int64 がないため float64 で受ける）。削除の If-Match に使う
          version: { type: "float64" },
          name: { type: "string" },
          category: { enum: ["固定費", "変動費"] },
        },
      },
    },
  },
} as const;

type GetSummaryResponse = JTD<typeof getSummaryResponse>;

const getResponse = {
  properties: {
    id: { type: "string" },
    // データのバージョン（int64。JTD に int64 がないため float64 で受ける）。削除の If-Match に使う
    version: { type: "float64" },
    name: { type: "string" },
    category: { enum: ["固定費", "変動費"] },
  },
} as const;

type GetResponse = JTD<typeof getResponse>;

const postRequest = {
  properties: {
    name: {
      type: "string",
    },
    category: {
      enum: ["固定費", "変動費"],
    },
  },
} as const;

type PostRequest = JTD<typeof postRequest>;

/** 更新できるのは属性名だけ（分類は登録後に変更できない） */
const putRequest = {
  properties: {
    name: {
      type: "string",
    },
  },
} as const;

type PutRequest = JTD<typeof putRequest>;

const _getSummary = async ({
  category,
  page,
  perPage,
  extension,
}: {
  category?: string;
  page: number;
  perPage: number;
  extension: object;
}): Promise<{ pagination: Pagination; response: GetSummaryResponse }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/expense-attributes",
    queries: {
      category,
      page: page.toString(),
      per_page: perPage.toString(),
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
    path: `/v1/expense-attributes/${id}`,
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

const _post = async ({ name, category }: PostRequest): Promise<void> => {
  const data = {
    name,
    category,
  };
  const response = await http.post({
    url: process.env.BACKEND_URL,
    path: "/v1/expense-attributes",
    requestBody: {
      schema: postRequest,
      data,
    },
  });
  console.log("POST /v1/expense-attributes");
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

const _put = async ({
  id,
  name,
  ifMatch,
}: {
  id: string;
  /** 取得時の ETag（楽観的ロック） */
  ifMatch: string;
} & PutRequest): Promise<void> => {
  const data = {
    name,
  };
  const response = await http.put({
    url: process.env.BACKEND_URL,
    path: `/v1/expense-attributes/${id}`,
    headers: { "if-match": ifMatch },
    requestBody: {
      schema: putRequest,
      data,
    },
  });
  console.log("PUT /v1/expense-attributes");
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
    path: `/v1/expense-attributes/${id}`,
    headers: { "if-match": ifMatch },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

export const expenseAttributesApi = {
  getSummary: _getSummary,
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
};
