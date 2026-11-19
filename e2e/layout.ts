import type { Page } from "@playwright/test";

export interface LayoutReport {
  overflowX: boolean;
  overflowY: boolean;
  escaped: string[];
}

export const layoutReport = (page: Page): Promise<LayoutReport> =>
  page.evaluate(() => {
    const root = document.documentElement;
    const scrolls = (element: Element) => {
      const style = getComputedStyle(element);
      return /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`);
    };
    const escaped = new Set<string>();
    for (const element of document.querySelectorAll<HTMLElement>("body *")) {
      if (getComputedStyle(element).position !== "absolute") continue;
      let scroller: Element | null = null;
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        if (scrolls(parent)) {
          scroller = parent;
          break;
        }
      }
      const base = element.offsetParent;
      if (scroller && base && !scroller.contains(base)) {
        escaped.add(
          `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
        );
      }
    }
    return {
      overflowX: root.scrollWidth > root.clientWidth + 1,
      overflowY: root.scrollHeight > root.clientHeight + 1,
      escaped: [...escaped],
    };
  });
