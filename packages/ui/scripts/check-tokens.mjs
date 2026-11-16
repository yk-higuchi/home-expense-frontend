import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const figma = JSON.parse(
  readFileSync(join(root, "design-tokens/figma-tokens.json"), "utf8"),
);
const css = readFileSync(join(root, "src/tokens.css"), "utf8");

const TEXT_STYLES = {
  "文字/本文": {
    size: "--text-body-size",
    lineHeight: "--text-body-line-height",
  },
  "文字/本文（1行）": {
    size: "--text-body-size",
    lineHeight: "--text-single-line-line-height",
  },
  "文字/補足": {
    size: "--text-caption-size",
    lineHeight: "--text-caption-line-height",
  },
  "文字/小見出し": {
    size: "--text-subheading-size",
    lineHeight: "--text-subheading-line-height",
  },
  "文字/見出し": {
    size: "--text-heading-size",
    lineHeight: "--text-heading-line-height",
    weight: "--text-heading-weight",
  },
  "文字/金額": {
    size: "--text-body-size",
    lineHeight: "--text-body-line-height",
    numeric: ["--text-amount-numeric", "tabular-nums"],
  },
};
const EFFECT_STYLES = { "影/浮き上がり": "--shadow-raised" };
const FONT_WEIGHTS = { Regular: 400, Medium: 500, Bold: 700 };

const declarations = new Map(
  [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g),
  ].map(([, name, value]) => [
    name,
    value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")"),
  ]),
);

const errors = [];
const warnings = [];
const checked = new Set();

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

const resolveVar = (value, depth = 0) => {
  const ref = value?.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  return ref && depth < 5
    ? resolveVar(declarations.get(ref), depth + 1)
    : value;
};
const cssBySizeName = new Map(figma.sizes.map((s) => [s.name, s.css]));
for (const size of figma.sizes) {
  if (!size.css) {
    errors.push(`Figma の「${size.name}」にコード名（WEB）がない`);
    continue;
  }
  const value = declarations.get(size.css);
  expect(size.css, value && px(resolveVar(value)), size.value, size.name);
  if (value && size.ref) {
    const expected = `var(${cssBySizeName.get(size.ref)})`;
    if (value !== expected) {
      errors.push(
        `${size.css}: tokens.css は ${value} を参照、Figma（${size.name}）は ${size.ref}（${expected}）を参照`,
      );
    }
  }
}

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
  const ratio = (value) => {
    const match = value?.match(/^calc\(\s*([\d.]+)\s*\/\s*([\d.]+)\s*\)$/);
    return match ? Number(match[1]) / Number(match[2]) : Number(value);
  };
  const expectedRatio =
    typeof style.lineHeight === "string" && style.lineHeight.endsWith("px")
      ? Number.parseFloat(style.lineHeight) / style.fontSize
      : style.lineHeight;
  checked.add(map.lineHeight);
  const actualRatio = get(map.lineHeight) && ratio(get(map.lineHeight));
  if (actualRatio === undefined) {
    errors.push(
      `${map.lineHeight} が tokens.css にない（Figma: ${style.name}）`,
    );
  } else if (Math.abs(actualRatio - expectedRatio) > 1e-6) {
    errors.push(
      `${map.lineHeight}: tokens.css は ${get(map.lineHeight)}、Figma（${style.name}）は ${style.lineHeight}`,
    );
  }
  if (map.numeric) {
    const [name, value] = map.numeric;
    expect(name, get(name), value, style.name);
  }
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
