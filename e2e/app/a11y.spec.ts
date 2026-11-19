import { expect, test } from "@playwright/test";
import { axeViolations } from "../axe";
import { pages } from "./pages";

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
