import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_REPOSITORY = "yk-higuchi/home-expense-backend";
const SCHEMA_FILE = "openapi.schema.json";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const generated = join(root, "src/network/generated");
const schemaOutput = join(generated, "schema.ts");
const typesOutput = join(generated, "types.ts");
const version = readFileSync(join(root, "api-version"), "utf8").trim();

const COMMIT = /^[0-9a-f]{40}$/;

const readFromRelease = () => {
  const dir = mkdtempSync(join(tmpdir(), "openapi-schema-"));
  try {
    execFileSync(
      "gh",
      [
        "release",
        "download",
        `v${version}`,
        "-R",
        BACKEND_REPOSITORY,
        "-p",
        SCHEMA_FILE,
        "-D",
        dir,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
    return readFileSync(join(dir, SCHEMA_FILE), "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const readFromCommit = async () => {
  const url = `https://raw.githubusercontent.com/${BACKEND_REPOSITORY}/${version}/docs/${SCHEMA_FILE}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} を取得できませんでした（${response.status}）`);
  }
  return response.text();
};

const readSource = async () => {
  const local = process.env.API_SCHEMA_SOURCE;
  if (local) return readFileSync(local, "utf8");
  return COMMIT.test(version) ? readFromCommit() : readFromRelease();
};

const SUPPORTED = new Set([
  "$ref",
  "type",
  "enum",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "description",
  "title",
  "examples",
  "format",
  "pattern",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "minItems",
  "maxItems",
  "default",
  "readOnly",
  "writeOnly",
  "deprecated",
]);

const key = (name) =>
  /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);

const toType = (schema, path) => {
  for (const keyword of Object.keys(schema)) {
    if (!SUPPORTED.has(keyword)) {
      throw new Error(
        `${path}: 型にできないキーワード ${keyword} があります（gen-api.mjs の toType に足す）`,
      );
    }
  }
  if (schema.$ref) {
    const name = schema.$ref.replace(/^#\/\$defs\//, "");
    return `Schemas[${JSON.stringify(name)}]`;
  }
  if (schema.enum) {
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  return types
    .map((type) => {
      switch (type) {
        case "string":
          return "string";
        case "integer":
        case "number":
          return "number";
        case "boolean":
          return "boolean";
        case "null":
          return "null";
        case "array":
          return `(${toType(schema.items ?? {}, `${path}.items`)})[]`;
        case "object": {
          const required = new Set(schema.required ?? []);
          const fields = Object.entries(schema.properties ?? {}).map(
            ([name, property]) =>
              `${key(name)}${required.has(name) ? "" : "?"}: ${toType(property, `${path}.${name}`)};`,
          );
          return `{ ${fields.join(" ")} }`;
        }
        case undefined:
          return "unknown";
        default:
          throw new Error(`${path}: 型にできない type ${type} があります`);
      }
    })
    .join(" | ");
};

const source = await readSource();
const document = JSON.parse(source);
const names = Object.keys(document.$defs).sort();

writeFileSync(
  schemaOutput,
  `export const openApiSchema = ${JSON.stringify(document)};\n`,
);
writeFileSync(
  typesOutput,
  `export interface Schemas {\n${names
    .map((name) => `  ${key(name)}: ${toType(document.$defs[name], name)};`)
    .join("\n")}\n}\n`,
);
execFileSync("npx", ["biome", "format", "--write", schemaOutput, typesOutput], {
  cwd: root,
  stdio: "ignore",
});
console.log(
  `${names.length} 個のスキーマを ${schemaOutput} と ${typesOutput} に書き出しました`,
);
