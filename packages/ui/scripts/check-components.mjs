import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "../..");
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const figma = readJson("design-components/figma-components.json");
const map = readJson("design-components/component-map.json");

const index = readFileSync(join(root, "src/index.ts"), "utf8");
const exported = new Set(
  [...index.matchAll(/^export \{([^}]*)\}/gms)].flatMap(([, names]) =>
    names
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  ),
);
const isComponentLike = (name) => /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);

const listFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
const appSources = listFiles(join(repo, "app/src"))
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
const stories = listFiles(join(root, "src")).filter((file) =>
  file.endsWith(".stories.tsx"),
);

const errors = [];
const figmaByName = new Map(figma.components.map((c) => [c.name, c]));
const knownNodes = new Set([
  ...figma.frames.map((f) => f.id),
  ...figma.components.flatMap((c) => [c.id, ...c.variants.map((v) => v.id)]),
]);
const mapped = new Set();

for (const component of figma.components) {
  if (!map.figma[component.name]) {
    errors.push(
      `Figma の「${component.name}」（${component.id}）が component-map.json にない`,
    );
  }
}

for (const [name, entry] of Object.entries(map.figma)) {
  const component = figmaByName.get(name);
  if (!component) {
    errors.push(`component-map.json の「${name}」が Figma にない`);
    continue;
  }
  const code = entry.code ?? [];
  const source = entry.source ?? [];
  if (code.length === 0 && source.length === 0) {
    errors.push(`「${name}」に対応するコード（code か source）がない`);
  }
  for (const exportName of code) {
    if (!exported.has(exportName)) {
      errors.push(
        `「${name}」の ${exportName} が packages/ui から公開されていない`,
      );
    }
    mapped.add(exportName);
  }
  for (const path of source) {
    if (!existsSync(join(repo, path))) {
      errors.push(`「${name}」の ${path} がない`);
    }
  }

  const axes = component.properties.filter((p) => p.type === "VARIANT");
  const variants = entry.variants ?? {};
  for (const axis of axes) {
    const values = variants[axis.name];
    if (!values) {
      errors.push(
        `「${name}」のバリアント「${axis.name}」（${axis.values.join("・")}）の対応がない`,
      );
      continue;
    }
    for (const value of axis.values) {
      if (!(value in values)) {
        errors.push(
          `「${name}」の ${axis.name}=${value} に対応するコードがない`,
        );
      }
    }
    for (const value of Object.keys(values)) {
      if (!axis.values.includes(value)) {
        errors.push(
          `「${name}」の ${axis.name}=${value} は Figma にない（対応表から消す）`,
        );
      }
    }
  }
  for (const axisName of Object.keys(variants)) {
    if (!axes.some((axis) => axis.name === axisName)) {
      errors.push(`「${name}」のバリアント「${axisName}」は Figma にない`);
    }
  }
}

for (const [name, reason] of Object.entries(map.codeOnly)) {
  if (!exported.has(name)) {
    errors.push(`codeOnly の ${name} が packages/ui から公開されていない`);
  } else if (mapped.has(name)) {
    errors.push(
      `codeOnly の ${name} は Figma の部品に対応している（codeOnly から消す）`,
    );
  } else if (!reason) {
    errors.push(`codeOnly の ${name} に理由がない`);
  }
}
for (const name of exported) {
  if (isComponentLike(name) && !mapped.has(name) && !(name in map.codeOnly)) {
    errors.push(
      `${name} に対応する Figma の部品がない（component-map.json の figma か codeOnly に足す）`,
    );
  }
}

let links = 0;
for (const file of stories) {
  const text = readFileSync(file, "utf8");
  for (const [, fileKey, nodeId] of text
    .matchAll(/figma\.com\/design\/([A-Za-z0-9]+)\/[^"]*node-id=(\d+)-(\d+)/g)
    .map((m) => [m[0], m[1], `${m[2]}:${m[3]}`])) {
    links++;
    const story = file.slice(root.length + 1);
    if (fileKey !== figma.fileKey) {
      errors.push(
        `${story} の Figma のリンクが別のファイル（${fileKey}）を指している`,
      );
    } else if (!knownNodes.has(nodeId)) {
      errors.push(`${story} の Figma のリンク（${nodeId}）が Figma にない`);
    }
  }
}

for (const component of figma.components) {
  const description = component.description ?? "";
  for (const [, path] of description.matchAll(/コード: ?([\w./-]+\.tsx)/g)) {
    const found = ["app/src", "app/src/ui", "packages/ui/src"].some((dir) =>
      existsSync(join(repo, dir, path)),
    );
    if (!found) {
      errors.push(`Figma の「${component.name}」の説明にある ${path} がない`);
    }
  }
  for (const [, name] of description.matchAll(
    /コード: ?([A-Za-z][A-Za-z0-9]*)(?![\w./=-])/g,
  )) {
    if (!exported.has(name) && !new RegExp(`\\b${name}\\b`).test(appSources)) {
      errors.push(
        `Figma の「${component.name}」の説明にある ${name} がコードにない`,
      );
    }
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\nFigma の部品とコードが ${errors.length} 件ずれています。`);
  process.exit(1);
}
console.log(
  `Figma の部品とコードは対応しています（部品 ${figma.components.length} 件、Storybook の Figma のリンク ${links} 件を照合）。`,
);
