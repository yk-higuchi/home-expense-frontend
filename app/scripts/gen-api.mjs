import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_REPOSITORY = "yk-higuchi/home-expense-backend";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "src/lib/api/generated/jtd.ts");
const version = readFileSync(join(root, "api-version"), "utf8").trim();

const COMMIT = /^[0-9a-f]{40}$/;

const readFromRelease = () => {
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
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const readFromCommit = async () => {
  const url = `https://raw.githubusercontent.com/${BACKEND_REPOSITORY}/${version}/docs/openapi.jtd.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} を取得できませんでした（${response.status}）`);
  }
  return response.text();
};

const readSource = async () => {
  const local = process.env.API_JTD_SOURCE;
  if (local) return readFileSync(local, "utf8");
  return COMMIT.test(version) ? readFromCommit() : readFromRelease();
};

const source = await readSource();
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
