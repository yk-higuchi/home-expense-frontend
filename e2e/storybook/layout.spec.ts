import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { layoutReport } from "../layout";

interface IndexEntry {
  id: string;
  type: string;
  title: string;
  name: string;
}

const index = JSON.parse(
  readFileSync("packages/ui/storybook-static/index.json", "utf8"),
) as { entries: Record<string, IndexEntry> };

const stories = Object.values(index.entries).filter(
  (entry) => entry.type === "story",
);

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator("#storybook-root > *").first().waitFor();
    const report = await layoutReport(page);
    expect(report.escaped).toEqual([]);
  });
}
