/*
 * バックエンドが OpenAPI から生成した JTD スキーマ（openapi.jtd.json）を取得し、
 * src/lib/api/generated/jtd.ts（スキーマごとの `export const X = {...} as const;`）に変換する。
 *
 * 取得元
 * - 環境変数 API_JTD_SOURCE があれば、そのファイル（バックエンドのリポジトリの docs/openapi.jtd.json など）
 * - なければ、api-version に書いた版の GitHub Release に添付された openapi.jtd.json（gh が必要）
 *
 * JSON をそのまま import すると文字列が string に広がり、JTDDataType で正しい型にならないため、as const 付きの TS にする。
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_REPOSITORY = "yk-higuchi/home-expense-backend";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "src/lib/api/generated/jtd.ts");
const version = readFileSync(join(root, "api-version"), "utf8").trim();

const readSource = () => {
  const local = process.env.API_JTD_SOURCE;
  if (local) return readFileSync(local, "utf8");
  const dir = mkdtempSync(join(tmpdir(), "openapi-jtd-"));
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
        "openapi.jtd.json",
        "-D",
        dir,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
    return readFileSync(join(dir, "openapi.jtd.json"), "utf8");
  } catch (error) {
    console.error(
      `v${version} の openapi.jtd.json を取得できませんでした。Release がまだない場合は、API_JTD_SOURCE にバックエンドの docs/openapi.jtd.json を指定してください。`,
    );
    throw error;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const source = readSource();
const schemas = JSON.parse(source);
const digest = createHash("sha256").update(source).digest("hex").slice(0, 16);
const body = Object.keys(schemas)
  .sort()
  .map(
    (name) =>
      `export const ${name} = ${JSON.stringify(schemas[name])} as const;`,
  )
  .join("\n\n");
writeFileSync(
  output,
  `// このファイルは scripts/gen-api.mjs が生成する。手で編集しない（pnpm gen:api で作り直す）
// 元: バックエンドの openapi.jtd.json（api-version: ${version}、sha256: ${digest}）

${body}
`,
);
execFileSync("npx", ["biome", "format", "--write", output], {
  cwd: root,
  stdio: "ignore",
});
console.log(
  `${Object.keys(schemas).length} 個のスキーマを ${output} に書き出しました`,
);
