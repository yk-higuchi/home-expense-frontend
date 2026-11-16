import type { Schema, SchemaName } from "@/network/schema/type";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Mode = RequestMode;
type Cache = RequestCache;
type Credentials = RequestCredentials;

export interface HttpRequest {
  url: string;
  path: string;
  queries?: Record<string, string | undefined>;
  method: Method;
  headers?: Record<string, string>;
  requestBody?: RequestBody;
  mode?: Mode;
  cache?: Cache;
  credentials?: Credentials;
  timeout?: number;
  extension?: object;
}

export interface RequestBody {
  schema: SchemaName;
  data: unknown;
}

interface Success {
  type: "success";
  code: number;
  headers?: Record<string, string>;
  body: <N extends SchemaName>(name: N) => Promise<Schema<N>>;
}

interface Failure {
  type: "failure";
  error: Error;
}

export type HttpResponse = Readonly<Success> | Readonly<Failure>;
