import { execFileSync } from "node:child_process";
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
const body = Object.keys(schemas)
  .sort()
  .map(
    (name) =>
      `export const ${name} = ${JSON.stringify(schemas[name])} as const;`,
  )
  .join("\n\n");
writeFileSync(output, `${body}\n`);
execFileSync("npx", ["biome", "format", "--write", output], {
  cwd: root,
  stdio: "ignore",
});
console.log(
  `${Object.keys(schemas).length} 個のスキーマを ${output} に書き出しました`,
);
