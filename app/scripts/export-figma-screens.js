// biome-ignore lint/correctness/noUnusedVariables: Figma 上で呼び出す
async function exportFigmaScreens(pageName) {
  const FILTERS = new Set(["年", "月", "分類", "属性名"]);
  const FILTER_FRAMES = new Set(["絞り込み", "年月選択", "年月"]);
  const ROW_SETS = new Set([
    "支出テーブル行",
    "収入テーブル行",
    "支出属性テーブル行",
    "収入属性テーブル行",
    "月別行",
  ]);
  const page = figma.root.children.find((p) => p.name === pageName);
  await figma.setCurrentPageAsync(page);
  const round = (value) => Math.round(value);
  const screens = [];
  for (const section of page.children.filter((n) => n.type === "SECTION")) {
    for (const frame of section.children.filter((n) => n.type === "FRAME")) {
      const match = frame.name.match(/^(.*) \/ (\d+)$/);
      if (!match) continue;
      const shown = (node) => {
        for (let n = node; n && n !== frame; n = n.parent)
          if (n.visible === false) return false;
        return true;
      };
      const box = (node) => node.absoluteBoundingBox;
      const origin = box(frame);
      const sidebar = frame.findOne((n) => n.name === "サイドバー" && shown(n));
      const main = frame.findOne(
        (n) => n.name === "メインコンテンツ" && shown(n),
      );
      let content = null;
      let controls = [];
      let table = null;
      if (main) {
        const b = box(main);
        const stroke =
          main.strokesIncludedInLayout && main.strokes.length > 0
            ? main.strokeWeight
            : 0;
        content = {
          x: round(b.x - origin.x + stroke + main.paddingLeft),
          y: round(b.y - origin.y + stroke + main.paddingTop),
          width: round(
            b.width - stroke * 2 - main.paddingLeft - main.paddingRight,
          ),
        };
        const place = (node) => {
          const r = box(node);
          return {
            x: round(r.x - origin.x - content.x),
            y: round(r.y - origin.y - content.y),
            width: round(r.width),
          };
        };
        controls = main
          .findAll(
            (n) =>
              n.type === "INSTANCE" &&
              shown(n) &&
              ((FILTERS.has(n.name) &&
                n.mainComponent?.parent?.name === "プルダウン" &&
                FILTER_FRAMES.has(n.parent.name)) ||
                n.name === "追加ボタン"),
          )
          .map((n) => ({
            name: n.name === "追加ボタン" ? "追加" : n.name,
            ...place(n),
          }));
        const rows = main.findAll(
          (n) =>
            n.type === "INSTANCE" &&
            shown(n) &&
            ROW_SETS.has(n.mainComponent?.parent?.name),
        );
        if (rows.length > 0)
          table = {
            header: rows.some((r) => /種類=見出し/.test(r.mainComponent.name)),
            layout: rows.some((r) =>
              /幅=スマートフォン/.test(r.mainComponent.name),
            )
              ? "スマートフォン"
              : "列",
          };
      }
      screens.push({
        id: frame.id,
        page: pageName,
        state: match[1],
        width: Number(match[2]),
        height: round(frame.height),
        sidebar: sidebar ? { width: round(sidebar.width) } : null,
        content: content && { x: content.x, width: content.width },
        controls,
        table,
      });
    }
  }
  return screens;
}
