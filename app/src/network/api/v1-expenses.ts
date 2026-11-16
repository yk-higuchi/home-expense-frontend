import * as process from "node:process";

import { http } from "@/network/http";
import {
  type PageLinks,
  parseLinkHeader,
} from "@/network/pagination/pagination";
import type { Schema } from "@/network/schema/type";

const getSummaryResponse = "ExpenseListResponse" as const;
const getResponse = "ExpenseGetResponse" as const;
const postRequest = "ExpensePostRequest" as const;
const putRequest = "ExpensePutRequest" as const;

type GetSummaryResponse = Schema<typeof getSummaryResponse>;
type GetResponse = Schema<typeof getResponse>;
type PostRequest = Schema<typeof postRequest>;
type PutRequest = Schema<typeof putRequest>;

const _getSummary = async ({
  page,
  perPage,
  year,
  month,
  category,
  attributeId,
  extension,
}: {
  page: number;
  perPage: number;
  year?: number;
  month?: number;
  category?: string;
  attributeId?: string;
  extension: object;
}): Promise<{ pagination: PageLinks; response: GetSummaryResponse }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/expenses",
    queries: {
      page: page.toString(),
      per_page: perPage.toString(),
      ...(year && { year: year.toString() }),
      ...(month && { month: month.toString() }),
      category,
      attribute_id: attributeId,
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
    path: `/v1/expenses/${id}`,
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
  payment_date,
}: PostRequest): Promise<string> => {
  const data = {
    description,
    attribute_id,
    amount,
    payment_date,
  };
  const response = await http.post({
    url: process.env.BACKEND_URL,
    path: "/v1/expenses",
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
  payment_date,
  ifMatch,
}: {
  id: string;
  ifMatch: string;
} & PutRequest): Promise<void> => {
  const data = {
    description,
    attribute_id,
    amount,
    payment_date,
  };
  const response = await http.put({
    url: process.env.BACKEND_URL,
    path: `/v1/expenses/${id}`,
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
    path: `/v1/expenses/${id}`,
    headers: { "if-match": ifMatch },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

export const expensesApi = {
  get: _get,
  getSummary: _getSummary,
  post: _post,
  put: _put,
  delete: _delete,
};
