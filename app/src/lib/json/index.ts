import Ajv from "ajv/dist/jtd";

import { JSONParseError, JSONSerializeError } from "@/lib/json/error";
import type { JTDSchema } from "@/lib/json/type";

const ajv = new Ajv();

const serialize = (schema: JTDSchema, data: unknown): string => {
  try {
    const serializer = ajv.compileSerializer(schema);
    return serializer(data);
  } catch (e: unknown) {
    const options = {
      cause: e,
    };
    throw new JSONSerializeError(
      `data serialize failed: ${String(data)}`,
      options,
    );
  }
};

/**
 * properties を持つ箇所すべてに additionalProperties: true を付ける。
 * バックエンドがレスポンスに項目を足しても（互換性のある変更）、解析が失敗しないようにする
 */
const allowAdditionalProperties = (schema: JTDSchema): JTDSchema => {
  if (typeof schema !== "object" || schema === null) return schema;
  const result: JTDSchema = Array.isArray(schema) ? [...schema] : { ...schema };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "object" && value !== null) {
      result[key] = allowAdditionalProperties(value as JTDSchema);
    }
  }
  if ("properties" in result || "optionalProperties" in result) {
    result.additionalProperties = true;
  }
  return result;
};

const parse = <T>(schema: JTDSchema, json: string): T => {
  const parser = ajv.compileParser<T>(allowAdditionalProperties(schema));
  const parsed = parser(json);
  if (parsed === undefined) {
    throw new JSONParseError(`json parse failed: ${json}`);
  }
  return parsed;
};

export const json = {
  serialize,
  parse,
};
