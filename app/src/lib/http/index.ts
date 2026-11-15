import { HttpError, parseProblem } from "@/lib/http/error";
import type { HttpRequest, HttpResponse, RequestBody } from "@/lib/http/type";
import { json } from "@/lib/json";
import type { JTDSchema } from "@/lib/json/type";

const _get = async (
  params: Omit<HttpRequest, "method">,
): Promise<HttpResponse> => {
  return await sendAndResolve({ ...params, method: "GET" });
};

const _post = async (
  params: Omit<HttpRequest, "method">,
): Promise<HttpResponse> => {
  return await sendAndResolve({ ...params, method: "POST" });
};

const _put = async (
  params: Omit<HttpRequest, "method">,
): Promise<HttpResponse> => {
  return await sendAndResolve({ ...params, method: "PUT" });
};

const _delete = async (
  params: Omit<HttpRequest, "method">,
): Promise<HttpResponse> => {
  return await sendAndResolve({ ...params, method: "DELETE" });
};

const sendAndResolve = async (params: HttpRequest): Promise<HttpResponse> => {
  try {
    const response = await send({ ...params });
    return await resolveWithResponse(response);
  } catch (e: unknown) {
    return resolveWithError(e);
  }
};

const send = async ({
  url,
  path,
  queries,
  method,
  headers,
  requestBody,
  mode = "cors",
  cache = "no-store",
  credentials = "same-origin",
  timeout = 3000,
  extension = {},
}: HttpRequest): Promise<Response> => {
  const controller = new AbortController();
  const _timeout = setTimeout(() => {
    controller.abort();
  }, timeout);
  try {
    const urlValue = new URL(path, url);
    if (queries) {
      const _queries = Object.fromEntries(
        Object.entries(queries).filter(
          (entry): entry is [string, string] => entry[1] !== undefined,
        ),
      );
      urlValue.search = new URLSearchParams(_queries).toString();
    }
    const body = serializeRequestBody(requestBody);
    return await fetch(urlValue, {
      method,
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body,
      signal: controller.signal,
      mode,
      cache,
      credentials,
      ...extension,
    });
  } finally {
    clearTimeout(_timeout);
  }
};

const serializeRequestBody = (requestBody?: RequestBody) => {
  if (requestBody) {
    const { serialize } = json;
    return serialize(requestBody.schema, requestBody.data);
  }
  return;
};

const resolveWithResponse = async (
  response: Response,
): Promise<HttpResponse> => {
  const body = async <T>(schema: JTDSchema): Promise<T> => {
    const { parse } = json;
    const responseJson: unknown = await response.json();
    return parse<T>(schema, JSON.stringify(responseJson));
  };
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  if (response.ok) {
    return {
      type: "success",
      code: response.status,
      headers,
      body,
    };
  }
  // エラーの本文（Problem Details）から、利用者向けの説明と trace_id を取り出す
  const { detail, traceId } = await parseProblem(response);
  return {
    type: "failure",
    error: new HttpError(response.status, detail, traceId),
  };
};

const resolveWithError = (e: unknown): HttpResponse => {
  if (e instanceof Error) {
    return {
      type: "failure",
      error: e,
    };
  }
  return {
    type: "failure",
    error: Error(String(e)),
  };
};

export const http = {
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
};
