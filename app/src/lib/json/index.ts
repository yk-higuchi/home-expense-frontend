import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import { openApiSchema } from "@/lib/api/generated/schema";
import { JSONParseError, JSONSerializeError } from "@/lib/json/error";
import type { Schema, SchemaName } from "@/lib/json/type";

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv, ["date", "uuid", "uri", "int32", "int64"]);
ajv.addSchema(openApiSchema);

const validatorFor = (name: SchemaName) => {
  const validate = ajv.getSchema(`${openApiSchema.$id}#/$defs/${name}`);
  if (validate === undefined) throw new Error(`schema not found: ${name}`);
  return validate;
};

const validate = <N extends SchemaName>(name: N, data: unknown): Schema<N> => {
  const check = validatorFor(name);
  if (!check(data)) {
    throw new JSONParseError(`${name}: ${ajv.errorsText(check.errors)}`);
  }
  return data as Schema<N>;
};

const parse = <N extends SchemaName>(name: N, text: string): Schema<N> =>
  validate(name, JSON.parse(text));

const serialize = (name: SchemaName, data: unknown): string => {
  const check = validatorFor(name);
  if (!check(data)) {
    throw new JSONSerializeError(`${name}: ${ajv.errorsText(check.errors)}`);
  }
  return JSON.stringify(data);
};

export const json = { parse, serialize, validate };
