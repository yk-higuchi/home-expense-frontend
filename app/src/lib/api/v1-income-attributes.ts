import process from "node:process";

import {
  IncomeAttributeGetResponse,
  IncomeAttributeListPatchRequest,
  IncomeAttributeListResponse,
  IncomeAttributePostRequest,
  IncomeAttributePutRequest,
} from "@/lib/api/generated/jtd";
import { http } from "@/lib/http";
import type { JTD } from "@/lib/json/type";

const getSummaryResponse = IncomeAttributeListResponse;
const getResponse = IncomeAttributeGetResponse;
const postRequest = IncomeAttributePostRequest;
const putRequest = IncomeAttributePutRequest;
const patchRequest = IncomeAttributeListPatchRequest;

type GetSummaryResponse = JTD<typeof getSummaryResponse>;
type GetResponse = JTD<typeof getResponse>;
type PostRequest = JTD<typeof postRequest>;
type PutRequest = JTD<typeof putRequest>;

const _getList = async ({
  extension,
}: {
  extension: object;
}): Promise<{ response: GetSummaryResponse; etag: string }> => {
  const response = await http.get({
    url: process.env.BACKEND_URL,
    path: "/v1/income-attributes",
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
  from,
  to,
  ifMatch,
}: {
  from: number;
  to: number;
  ifMatch: string;
}): Promise<{ etag: string }> => {
  const response = await http.patch({
    url: process.env.BACKEND_URL,
    path: "/v1/income-attributes",
    headers: {
      "content-type": "application/json-patch+json",
      "if-match": ifMatch,
    },
    requestBody: {
      schema: patchRequest,
      data: [
        {
          op: "move",
          from: `/income_attributes/${from}`,
          path: `/income_attributes/${to}`,
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
    path: `/v1/income-attributes/${id}`,
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

const _post = async ({ name }: PostRequest): Promise<string> => {
  const data = {
    name,
  };
  const response = await http.post({
    url: process.env.BACKEND_URL,
    path: "/v1/income-attributes",
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
    path: `/v1/income-attributes/${id}`,
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
    path: `/v1/income-attributes/${id}`,
    headers: { "if-match": ifMatch },
  });
  switch (response.type) {
    case "success":
      return;
    case "failure":
      throw response.error;
  }
};

export const incomeAttributesApi = {
  getList: _getList,
  reorder: _reorder,
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
};
