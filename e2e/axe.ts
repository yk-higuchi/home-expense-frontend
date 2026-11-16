import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export const axeViolations = async (
  page: Page,
  { include, disableRules = [] }: { include?: string; disableRules?: string[] } = {},
) => {
  const builder = new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .disableRules(disableRules);
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    targets: nodes.map((node) => node.target.join(" ")),
  }));
};
