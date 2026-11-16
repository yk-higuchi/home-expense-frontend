import { expect, test } from "@playwright/test";
import { axeViolations } from "../axe";

const pages = [
  "/home?year=2026&month=3",
  "/expense?year=2026&month=3",
  "/expense/registration",
  "/income?year=2025",
  "/income/registration",
  "/expense-attribute?category=固定費",
  "/expense-attribute/registration",
  "/income-attribute",
  "/income-attribute/registration",
  "/annual-report?year=2025",
  "/expense/00000000-0000-0000-0000-000000000000",
  "/no-such-page",
];

for (const width of [1440, 390]) {
  test.describe(`幅 ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(await axeViolations(page)).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      });
    }
  });
}
