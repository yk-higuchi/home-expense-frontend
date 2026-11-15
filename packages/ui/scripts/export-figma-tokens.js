/*
 * Figma の変数・スタイルを design-tokens/figma-tokens.json の形で書き出す（Figma のプラグイン API で動かす）。
 *
 * 使い方: Figma の MCP（use_figma）や Scripter などで、このファイルの中身の後ろに
 *   return await exportFigmaTokens();
 * を付けて「経費管理システム」（k99TXVIrWbQ9YYSNBnbaFW）で実行し、
 * 返ってきた JSON を design-tokens/figma-tokens.json に保存する。
 * その後 `pnpm --filter @home-expense/ui lint:tokens` で tokens.css と照合する。
 *
 * 書き出すもの
 * - colors: 「補助カラー」の変数（コード名 WEB = CSS 変数名、参照している「基礎カラー」の名前）
 * - sizes: SDS の Size コレクションのうち、このファイルが参照している Space / Radius / Stroke
 * - textStyles: ローカルの文字スタイル（SDS/*）
 * - effectStyles: 部品で使っている影のスタイル
 */

// biome-ignore lint/correctness/noUnusedVariables: Figma 上で呼び出す
async function exportFigmaTokens() {
  const f = figma;
  const hex = (c) => {
    const h = `#${[c.r, c.g, c.b]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    return c.a !== undefined && c.a < 1
      ? { hex: h, alpha: Math.round(c.a * 100) / 100 }
      : { hex: h };
  };
  const resolve = async (variable, modeId) => {
    let value = variable.valuesByMode[modeId];
    const refs = [];
    for (let i = 0; i < 5 && value?.type === "VARIABLE_ALIAS"; i++) {
      const target = await f.variables.getVariableByIdAsync(value.id);
      const col = await f.variables.getVariableCollectionByIdAsync(
        target.variableCollectionId,
      );
      refs.push(target.name);
      value = target.valuesByMode[col.defaultModeId];
    }
    return { value, ref: refs[0] };
  };
  const cssName = (variable) =>
    variable.codeSyntax?.WEB?.match(/var\((--[a-z0-9-]+)\)/)?.[1];

  // 色: 補助カラー
  const collections = await f.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find((c) => c.name === "補助カラー");
  const colors = [];
  for (const id of semantic.variableIds) {
    const v = await f.variables.getVariableByIdAsync(id);
    const { value, ref } = await resolve(v, semantic.defaultModeId);
    colors.push({ name: v.name, css: cssName(v), ref, ...hex(value) });
  }

  // 余白・角丸・線: SDS の Size コレクション。
  // SDS はコミュニティのライブラリでチームライブラリの API からは読めないため、
  // このファイルが参照している SDS の変数から Size コレクションをたどる
  const page = f.root.children.find((p) => p.name.startsWith("コンポーネント"));
  await f.setCurrentPageAsync(page);
  const nodes = page.findAll(() => true);
  let sizeCollection;
  for (const n of nodes) {
    const b = n.boundVariables?.itemSpacing ?? n.boundVariables?.paddingLeft;
    if (!b) continue;
    const v = await f.variables.getVariableByIdAsync(b.id);
    const col = await f.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    if (col.remote && col.name === "Size") {
      sizeCollection = col;
      break;
    }
  }
  const sizes = [];
  for (const id of sizeCollection?.variableIds ?? []) {
    const v = await f.variables.getVariableByIdAsync(id);
    if (!/^(Space|Radius|Stroke)\//.test(v.name)) continue;
    const { value } = await resolve(v, sizeCollection.defaultModeId);
    sizes.push({ name: v.name, css: cssName(v), value });
  }

  // 文字スタイル
  const textStyles = (await f.getLocalTextStylesAsync()).map((s) => ({
    name: s.name,
    fontFamily: s.fontName.family,
    fontStyle: s.fontName.style,
    fontSize: s.fontSize,
    lineHeight:
      s.lineHeight.unit === "PERCENT"
        ? Math.round(s.lineHeight.value) / 100
        : s.lineHeight,
  }));

  // 影: 部品のページで使っている影のスタイル
  const effectIds = new Set();
  for (const n of nodes)
    if ("effectStyleId" in n && typeof n.effectStyleId === "string")
      if (n.effectStyleId) effectIds.add(n.effectStyleId);
  const effectStyles = [];
  for (const id of effectIds) {
    const s = await f.getStyleByIdAsync(id);
    effectStyles.push({
      name: s.name,
      shadows: s.effects
        .filter((e) => e.type === "DROP_SHADOW" && e.visible !== false)
        .map((e) => ({
          x: e.offset.x,
          y: e.offset.y,
          blur: e.radius,
          spread: e.spread ?? 0,
          ...hex(e.color),
        })),
    });
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  return {
    fileKey: f.fileKey ?? "k99TXVIrWbQ9YYSNBnbaFW",
    colors: colors.sort(byName),
    sizes: sizes.sort(byName),
    textStyles: textStyles.sort(byName),
    effectStyles: effectStyles.sort(byName),
  };
}
