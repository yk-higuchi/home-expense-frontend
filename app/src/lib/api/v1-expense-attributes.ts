import process from "node:process";

import {
  ExpenseAttributeGetResponse,
  ExpenseAttributeListPatchRequest,
  ExpenseAttributeListResponse,
  ExpenseAttributePostRequest,
  ExpenseAttributePutRequest,
} from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

const getSummaryResponse = ExpenseAttributeListResponse;
const getResponse = ExpenseAttributeGetResponse;
const postRequest = ExpenseAttributePostRequest;
const putRequest = ExpenseAttributePutRequest;
const patchRequest = ExpenseAttributeListPatchRequest;

type GetSummaryResponse = JTD<typeof getSummaryResponse>;
type GetResponse = JTD<typeof getResponse>;
type PostRequest = JTD<typeof postRequest>;
type PutRequest = JTD<typeof putRequest>;

const _getList = async ({
  category,
  extension,
}: {
  category?: string;
  extension: object;
}): Promise<{ response: GetSummaryResponse; etag: string }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/expense-attributes",
    queries: { category },
    extension,
  });
  switch (response.type) {
    case "success":
      return {
        response: await response.body<GetSummaryResponse>(getSummaryResponse),
        etag: response.headers?.etag ?? "",
      };
    case "failure":
      throw response.error;
  }
};

const _reorder = async ({
  category,
  from,
  to,
  ifMatch,
}: {
  category: string;
  from: number;
  to: number;
  ifMatch: string;
}): Promise<{ etag: string }> => {
  const response = await http.patch({
    url: process.env.BACKEND_URL,
    path: "/v1/expense-attributes",
    queries: { category },
    headers: {
      "content-type": "application/json-patch+json",
      "if-match": ifMatch,
    },
    requestBody: {
      schema: patchRequest,
      data: [
        {
          op: "move",
          from: `/expense_attributes/${from}`,
          path: `/expense_attributes/${to}`,
        },
      ],
    },
  });
  switch (response.type) {
    case "success":
      return { etag: response.headers?.etag ?? "" };
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

const _post = async ({ name, category }: PostRequest): Promise<string> => {
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
      return response.headers?.location?.split("/").pop() ?? "";
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
  getList: _getList,
  reorder: _reorder,
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
};
