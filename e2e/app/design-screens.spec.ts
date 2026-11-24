import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page, test } from "@playwright/test";

interface Control {
  name: string;
  x: number;
  y: number;
  width: number;
}

interface Screen {
  id: string;
  page: string;
  state: string;
  width: number;
  height: number;
  sidebar: { width: number } | null;
  content: { x: number; width: number } | null;
  controls: Control[];
  table: { header: boolean; layout: "列" | "スマートフォン" } | null;
}

interface Setup {
  path: string;
  prepare?: (page: Page) => Promise<void>;
}

const TOLERANCE = 1;
const ROW_GAP = 8;

const { screens } = JSON.parse(
  readFileSync(
    join(process.cwd(), "app/design-screens/figma-screens.json"),
    "utf8",
  ),
) as { screens: Screen[] };

const openFirstEdit = (list: string) => async (page: Page) => {
  await page.goto(list);
  const edit = page.getByRole("button", { name: /を編集$/ }).first();
  if (await edit.isVisible()) await edit.click();
  else {
    await page
      .getByRole("button", { name: /の操作$/ })
      .first()
      .click();
    await page.getByRole("button", { name: "編集", exact: true }).click();
  }
  await page.waitForURL(/\/[0-9a-f-]{36}/);
};

const openMenu = async (page: Page) => {
  await page.getByRole("button", { name: "メニュー" }).click();
};

const scrollToBottom = async (page: Page) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
};

const delayNavigation = (from: string, link: string) => async (page: Page) => {
  await page.goto(from);
  await page.route("**/*", async (route) => {
    if (route.request().headers().rsc) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    await route.continue();
  });
  const target = page.getByRole("link", { name: link, exact: true }).first();
  if (!(await target.isVisible()))
    await page.getByRole("button", { name: "メニュー" }).click();
  await target.click();
  await page.locator("[aria-busy=true]").first().waitFor();
};

const LIST: Record<string, string> = {
  支出: "/expense?year=2026&month=3",
  支出属性: "/expense-attribute",
  収入: "/income?year=2025",
  収入属性: "/income-attribute",
};

const setupFor = (screen: Screen): Setup | string => {
  const s = screen.state;
  if (/（エラー）$/.test(s)) return "バックエンドの失敗をテストから起こせない";
  if (s === "ページが見つかりません") return { path: "/no-such-page" };
  if (s.startsWith("HOME")) {
    if (s === "HOME（読み込み中）")
      return { path: "/expense", prepare: delayNavigation("/expense", "HOME") };
    return { path: "/home?year=2026&month=3" };
  }
  if (s.startsWith("年間レポート")) {
    if (s === "年間レポート（読み込み中）")
      return {
        path: "/home",
        prepare: delayNavigation("/home", "年間レポート"),
      };
    return { path: "/annual-report?year=2026" };
  }
  const feature = Object.keys(LIST)
    .sort((a, b) => b.length - a.length)
    .find((name) => s.startsWith(name));
  if (!feature) return `対応するページがない（${s}）`;
  const list = LIST[feature];
  const base = list.split("?")[0];
  if (s === `${feature}登録`) return { path: `${base}/registration` };
  if (s.includes("（見つかりません）"))
    return { path: `${base}/00000000-0000-0000-0000-000000000000` };
  if (s === `${feature}編集` || s.includes("編集（入力エラー）"))
    return { path: list, prepare: openFirstEdit(list) };
  if (s.includes("登録・編集（読み込み中）"))
    return { path: list, prepare: delayNavigation(list, "追加") };
  if (s.includes("一覧（読み込み中）"))
    return {
      path: "/home",
      prepare: delayNavigation("/home", feature),
    };
  if (s.includes("（メニューを開いた状態）"))
    return { path: list, prepare: openMenu };
  if (s.includes("（サイドメニューを隠した状態）"))
    return { path: list, prepare: openMenu };
  if (s.includes("（下までスクロールした状態）"))
    return { path: list, prepare: scrollToBottom };
  return { path: list };
};

const measure = (page: Page) =>
  page.evaluate(() => {
    const visible = (element: Element | null): element is HTMLElement =>
      element instanceof HTMLElement &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden";
    const onScreen = (element: Element) => {
      const r = element.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const nav = document.querySelector('nav[aria-label="メインメニュー"]');
    const main = document.querySelector("main");
    if (!main) return null;
    const style = getComputedStyle(main);
    const rect = main.getBoundingClientRect();
    const contentX = rect.x + main.clientLeft + parseFloat(style.paddingLeft);
    const contentY = rect.y + main.clientTop + parseFloat(style.paddingTop);
    const content = {
      x: Math.round(contentX),
      width: Math.round(
        main.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight),
      ),
    };
    const place = (element: Element, name: string) => {
      const r = element.getBoundingClientRect();
      return {
        name,
        x: Math.round(r.x - contentX),
        y: Math.round(r.y - contentY),
        width: Math.round(r.width),
      };
    };
    const controls = [];
    for (const box of main.querySelectorAll<HTMLElement>("[role=combobox]")) {
      const label = (
        document.querySelector(`label[for="${CSS.escape(box.id)}"]`)
          ?.textContent ??
        box.getAttribute("aria-label") ??
        ""
      ).trim();
      if (!["年", "月", "分類", "属性名"].includes(label)) continue;
      if (box.closest("form, [class*='formStyle']")) continue;
      const field = box.parentElement?.parentElement ?? box;
      if (visible(box) && onScreen(field)) controls.push(place(field, label));
    }
    const add = [...main.querySelectorAll("a, button")].find(
      (element) => element.textContent?.trim() === "追加",
    );
    if (visible(add ?? null) && add && onScreen(add))
      controls.push(place(add, "追加"));
    const table = main.querySelector("table");
    const head = table?.querySelector("thead");
    return {
      sidebar: visible(nav)
        ? { width: Math.round(nav.getBoundingClientRect().width) }
        : null,
      content,
      controls,
      table:
        table && visible(table)
          ? {
              header: Boolean(head && head.getBoundingClientRect().height > 1),
              layout:
                getComputedStyle(table).minWidth === "0px"
                  ? "スマートフォン"
                  : "列",
            }
          : null,
    };
  });

const rowsOf = (controls: Control[]): string[][] => {
  const sorted = [...controls].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: { y: number; names: { x: number; name: string }[] }[] = [];
  for (const control of sorted) {
    const row = rows.find((r) => Math.abs(r.y - control.y) <= ROW_GAP * 4);
    if (row) row.names.push(control);
    else rows.push({ y: control.y, names: [control] });
  }
  return rows.map((r) => r.names.sort((a, b) => a.x - b.x).map((c) => c.name));
};

const near = (actual: number, expected: number) =>
  Math.abs(actual - expected) <= TOLERANCE;

for (const screen of screens) {
  test(`${screen.page} › ${screen.state} / ${screen.width}`, async ({
    page,
  }) => {
    const setup = setupFor(screen);
    test.skip(
      typeof setup === "string",
      typeof setup === "string" ? setup : "",
    );
    if (typeof setup === "string") return;
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto(setup.path);
    if (setup.prepare) await setup.prepare(page);
    const actual = await measure(page);
    expect(actual, "本文（main）がない").not.toBeNull();
    if (!actual) return;
    const problems: string[] = [];
    if (Boolean(actual.sidebar) !== Boolean(screen.sidebar))
      problems.push(
        `サイドバー: Figma ${screen.sidebar ? "あり" : "なし"}、コード ${actual.sidebar ? "あり" : "なし"}`,
      );
    else if (
      actual.sidebar &&
      screen.sidebar &&
      !near(actual.sidebar.width, screen.sidebar.width)
    )
      problems.push(
        `サイドバーの幅: Figma ${screen.sidebar.width}、コード ${actual.sidebar.width}`,
      );
    if (screen.content) {
      if (!near(actual.content.x, screen.content.x))
        problems.push(
          `本文の左端: Figma ${screen.content.x}、コード ${actual.content.x}`,
        );
      if (!near(actual.content.width, screen.content.width))
        problems.push(
          `本文の幅: Figma ${screen.content.width}、コード ${actual.content.width}`,
        );
    }
    const figmaRows = rowsOf(screen.controls);
    const codeRows = rowsOf(actual.controls);
    if (JSON.stringify(figmaRows) !== JSON.stringify(codeRows))
      problems.push(
        `絞り込みと追加の並び: Figma ${JSON.stringify(figmaRows)}、コード ${JSON.stringify(codeRows)}`,
      );
    for (const expected of screen.controls) {
      const found = actual.controls.find((c) => c.name === expected.name);
      if (!found) continue;
      if (!near(found.width, expected.width))
        problems.push(
          `${expected.name} の幅: Figma ${expected.width}、コード ${found.width}`,
        );
      if (!near(found.x, expected.x))
        problems.push(
          `${expected.name} の左端: Figma ${expected.x}、コード ${found.x}`,
        );
    }
    if (screen.table) {
      if (!actual.table) problems.push("表: Figma あり、コード なし");
      else {
        if (screen.table.header !== actual.table.header)
          problems.push(
            `表の見出しの行: Figma ${screen.table.header ? "見える" : "見えない"}、コード ${actual.table.header ? "見える" : "見えない"}`,
          );
        if (screen.table.layout !== actual.table.layout)
          problems.push(
            `表の行の並び: Figma ${screen.table.layout}、コード ${actual.table.layout}`,
          );
      }
    }
    expect(problems, `Figma の画面 ${screen.id}`).toEqual([]);
  });
}
