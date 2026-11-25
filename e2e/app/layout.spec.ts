import { expect, type Page, test } from "@playwright/test";
import { layoutReport } from "../layout";
import { pages } from "./pages";

const sizes = [
  { width: 1440, height: 900 },
  { width: 1280, height: 600 },
  { width: 1024, height: 768 },
  { width: 800, height: 420 },
  { width: 390, height: 844 },
];

const expectContained = async (page: Page, width: number) => {
  const report = await layoutReport(page);
  expect(report.escaped).toEqual([]);
  expect(report.overflowX).toBe(false);
  if (width >= 1280) expect(report.overflowY).toBe(false);
};

for (const { width, height } of sizes) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height } });

    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("h1")).toHaveCount(1);
        await expectContained(page, width);
      });
    }

    for (const { path, label, value } of [
      { path: "/home?year=2026&month=3", label: "月", value: "10" },
      { path: "/annual-report?year=2026", label: "年", value: "2025" },
    ]) {
      test(`${path} で${label}を変える`, async ({ page }) => {
        await page.goto(path);
        await page.getByRole("combobox", { name: label, exact: true }).click();
        await page.getByRole("option", { name: value, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${value}`));
        await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
        await expectContained(page, width);
      });
    }
  });
}
