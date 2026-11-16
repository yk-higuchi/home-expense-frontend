import * as process from "node:process";

import { http } from "@/network/http";
import {
  type Pagination,
  parseLinkHeader,
} from "@/network/pagination/pagination";
import type { Schema } from "@/network/schema/type";

const getSummaryResponse = "IncomeListResponse" as const;
const getResponse = "IncomeGetResponse" as const;
const postRequest = "IncomePostRequest" as const;
const putRequest = "IncomePutRequest" as const;

type GetSummaryResponse = Schema<typeof getSummaryResponse>;
type GetResponse = Schema<typeof getResponse>;
type PostRequest = Schema<typeof postRequest>;
type PutRequest = Schema<typeof putRequest>;

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
        const responseBody = await response.body(getSummaryResponse);
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
      return {
        ...(await response.body(getResponse)),
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
}: PostRequest): Promise<string> => {
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
      return response.headers?.location?.split("/").pop() ?? "";
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
