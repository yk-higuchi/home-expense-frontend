import process from "node:process";

import {
  ExpenseAttributeGetResponse,
  ExpenseAttributeListResponse,
  ExpenseAttributePostRequest,
  ExpenseAttributePutRequest,
} from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";
import { type Pagination, parseLinkHeader } from "@/lib/pagination/pagination";

const getSummaryResponse = ExpenseAttributeListResponse;
const getResponse = ExpenseAttributeGetResponse;
const postRequest = ExpenseAttributePostRequest;
const putRequest = ExpenseAttributePutRequest;

type GetSummaryResponse = JTD<typeof getSummaryResponse>;
type GetResponse = JTD<typeof getResponse>;
type PostRequest = JTD<typeof postRequest>;
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
