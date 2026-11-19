// biome-ignore lint/correctness/noUnusedVariables: Figma 上で呼び出す
async function exportFigmaComponents() {
  const f = figma;
  const page = f.root.children.find((p) => p.name === "コンポーネント");
  await f.setCurrentPageAsync(page);

  const frames = [];
  const components = [];
  const visit = (node, frame, depth) => {
    if (node.type === "COMPONENT_SET" || node.type === "COMPONENT") {
      const definitions =
        node.type === "COMPONENT_SET" || node.parent?.type !== "COMPONENT_SET"
          ? node.componentPropertyDefinitions
          : {};
      const properties = Object.entries(definitions)
        .map(([key, d]) => ({
          name: key.replace(/#[^#]*$/, ""),
          type: d.type,
          ...(d.type === "VARIANT" ? { values: d.variantOptions } : {}),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      components.push({
        id: node.id,
        name: node.name,
        type: node.type === "COMPONENT_SET" ? "set" : "component",
        frame,
        description: node.description,
        properties,
        variants:
          node.type === "COMPONENT_SET"
            ? node.children.map((v) => ({ id: v.id, name: v.name }))
            : [],
      });
      return;
    }
    if (node.type === "FRAME" && depth <= 2) {
      frames.push({ id: node.id, name: node.name, frame });
    }
    if ("children" in node) {
      for (const child of node.children)
        visit(child, depth === 1 ? node.name : frame, depth + 1);
    }
  };
  for (const child of page.children) visit(child, child.name, 1);

  const byId = (a, b) => a.id.localeCompare(b.id, "en", { numeric: true });
  return {
    fileKey: f.fileKey ?? "k99TXVIrWbQ9YYSNBnbaFW",
    page: page.name,
    frames: frames.sort(byId),
    components: components.sort(byId),
  };
}
