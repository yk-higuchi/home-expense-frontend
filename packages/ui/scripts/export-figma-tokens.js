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

  const collections = await f.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find((c) => c.name === "補助カラー");
  const colors = [];
  for (const id of semantic.variableIds) {
    const v = await f.variables.getVariableByIdAsync(id);
    const { value, ref } = await resolve(v, semantic.defaultModeId);
    colors.push({ name: v.name, css: cssName(v), ref, ...hex(value) });
  }

  const sizeCollection = collections.find((c) => c.name === "サイズ");
  const sizes = [];
  for (const id of sizeCollection.variableIds) {
    const v = await f.variables.getVariableByIdAsync(id);
    const { value, ref } = await resolve(v, sizeCollection.defaultModeId);
    sizes.push({ name: v.name, css: cssName(v), ref, value });
  }

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

  const effectStyles = [];
  for (const s of await f.getLocalEffectStylesAsync()) {
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
