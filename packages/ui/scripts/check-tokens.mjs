/*
 * Figma の定義（design-tokens/figma-tokens.json）と src/tokens.css が一致しているか確かめる。
 * 一致しなければ終了コード 1（lint の一部として CI で動く）。
 *
 * - 色: Figma「補助カラー」の各変数のコード名（WEB）= CSS 変数名。値と、両方にあるかを確かめる
 * - 余白・角丸・線: SDS の変数のコード名（--sds-size-*）。Figma のファイルが参照していないものは警告だけ
 * - 文字・影: Figma の文字スタイル・影のスタイルにはコード名がないので、下の対応表で突き合わせる
 *
 * Figma を変えたら scripts/export-figma-tokens.js で JSON を書き出し直してから、このスクリプトを動かす。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const figma = JSON.parse(
  readFileSync(join(root, "design-tokens/figma-tokens.json"), "utf8"),
);
const css = readFileSync(join(root, "src/tokens.css"), "utf8");

/** 文字スタイル → CSS 変数（size: 文字の大きさ, lineHeight: 行の高さ, weight: 太さ） */
const TEXT_STYLES = {
  "SDS/Body Base": {
    size: "--text-body-size",
    lineHeight: "--text-body-line-height",
  },
  "SDS/Single Line/Body Base": {
    size: "--text-body-size",
    lineHeight: "--text-single-line-line-height",
  },
  "SDS/Subheading": {
    size: "--text-subheading-size",
    lineHeight: "--text-subheading-line-height",
  },
  "SDS/Body Small": {
    size: "--text-small-size",
    lineHeight: "--text-small-line-height",
  },
  "SDS/Heading": {
    size: "--text-heading-size",
    lineHeight: "--text-heading-line-height",
    weight: "--text-heading-weight",
  },
};
/** 影のスタイル → CSS 変数 */
const EFFECT_STYLES = { "Drop Shadow/200": "--sds-effect-shadow-200" };
const FONT_WEIGHTS = { Regular: 400, Medium: 500, Bold: 700 };

// tokens.css の :root の宣言（コメントを除いて読む）
const declarations = new Map(
  [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g),
  ].map(([, name, value]) => [name, value.trim().replace(/\s+/g, " ")]),
);

const errors = [];
const warnings = [];
const checked = new Set();

/** CSS の色を「#rrggbb」か「#rrggbb/透明度」にそろえる */
const normalizeColor = (value) => {
  const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short)
    return `#${short
      .slice(1)
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  const rgb = value.match(
    /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[/,]\s*([\d.]+)(%?))?\s*\)$/,
  );
  if (rgb) {
    const hex = `#${rgb
      .slice(1, 4)
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")}`;
    if (rgb[4] === undefined) return hex;
    const alpha = rgb[5] ? Number(rgb[4]) / 100 : Number(rgb[4]);
    return alpha === 1 ? hex : `${hex}/${alpha}`;
  }
  return value;
};
const figmaColor = ({ hex, alpha }) =>
  alpha === undefined ? hex : `${hex}/${alpha}`;
const px = (value) => (value === "0" ? 0 : Number(value.replace(/px$/, "")));

const expect = (name, actual, expected, label) => {
  checked.add(name);
  if (actual === undefined) {
    errors.push(`${name} が tokens.css にない（Figma: ${label}）`);
  } else if (actual !== expected) {
    errors.push(
      `${name}: tokens.css は ${actual}、Figma（${label}）は ${expected}`,
    );
  }
};

// 色
for (const color of figma.colors) {
  if (!color.css) {
    errors.push(`Figma の「${color.name}」にコード名（WEB）がない`);
    continue;
  }
  const actual = declarations.get(color.css);
  expect(
    color.css,
    actual && normalizeColor(actual),
    figmaColor(color),
    color.name,
  );
}

// 余白・角丸・線
const sizes = new Map(figma.sizes.map((s) => [s.css, s]));
for (const [name, value] of declarations) {
  if (!name.startsWith("--sds-size-")) continue;
  const size = sizes.get(name);
  if (!size) {
    checked.add(name);
    warnings.push(
      `${name}（${value}）は Figma のファイルで使われていないため、SDS の値と照合できない`,
    );
    continue;
  }
  expect(name, px(value), size.value, size.name);
}

// 文字
const fontFamily = declarations.get("--font-family-base") ?? "";
checked.add("--font-family-base");
for (const style of figma.textStyles) {
  const map = TEXT_STYLES[style.name];
  if (!map) {
    errors.push(
      `Figma の文字スタイル「${style.name}」に対応する CSS 変数がない（check-tokens.mjs の TEXT_STYLES に足す）`,
    );
    continue;
  }
  if (!fontFamily.includes(style.fontFamily)) {
    errors.push(
      `--font-family-base に ${style.fontFamily} がない（Figma: ${style.name}）`,
    );
  }
  const get = (n) => declarations.get(n);
  expect(
    map.size,
    get(map.size) && px(get(map.size)),
    style.fontSize,
    style.name,
  );
  expect(
    map.lineHeight,
    get(map.lineHeight) && Number(get(map.lineHeight)),
    style.lineHeight,
    style.name,
  );
  const weight = FONT_WEIGHTS[style.fontStyle];
  if (map.weight) {
    expect(
      map.weight,
      get(map.weight) && Number(get(map.weight)),
      weight,
      style.name,
    );
  } else if (weight !== 400) {
    errors.push(
      `Figma の「${style.name}」は ${style.fontStyle} だが、太さの CSS 変数がない`,
    );
  }
}
for (const name of Object.keys(TEXT_STYLES)) {
  if (!figma.textStyles.some((s) => s.name === name)) {
    errors.push(`対応表の文字スタイル「${name}」が Figma にない`);
  }
}

// 影
for (const effect of figma.effectStyles) {
  const name = EFFECT_STYLES[effect.name];
  if (!name) {
    errors.push(
      `Figma の影のスタイル「${effect.name}」に対応する CSS 変数がない（check-tokens.mjs の EFFECT_STYLES に足す）`,
    );
    continue;
  }
  const expected = effect.shadows
    .map((s) => {
      const [r, g, b] = [1, 3, 5].map((i) =>
        Number.parseInt(s.hex.slice(i, i + 2), 16),
      );
      const alpha = Math.round((s.alpha ?? 1) * 100);
      return `${s.x}${s.x ? "px" : ""} ${s.y}px ${s.blur}px ${s.spread}${s.spread ? "px" : ""} rgb(${r} ${g} ${b} / ${alpha}%)`;
    })
    .join(", ");
  expect(name, declarations.get(name), expected, effect.name);
}

// tokens.css にあって Figma と突き合わせていないもの
for (const name of declarations.keys()) {
  if (!checked.has(name)) {
    errors.push(
      `${name} は Figma に対応する定義がない（Figma に足すか、tokens.css から消す）`,
    );
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(
    `\nFigma の定義と tokens.css が ${errors.length} 件ずれています。`,
  );
  process.exit(1);
}
console.log(
  `tokens.css は Figma の定義と一致しています（${checked.size} 件を照合、警告 ${warnings.length} 件）。`,
);
