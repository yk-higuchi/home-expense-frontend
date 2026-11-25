import { expect, test } from "@playwright/test";

test("本文へ移動のリンクで main にフォーカスが移る", async ({ page }) => {
  await page.goto("/home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "本文へ移動" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("ページ送りはリンクで、押すと次のページを表示する", async ({ page }) => {
  await page.goto("/expense?year=2026&month=3");
  const next = page.getByRole("link", { name: "2 ページ", exact: true });
  await expect(next).toHaveAttribute("href", /page=2/);
  await next.click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator("main tbody tr").first()).toContainText("21");
});

test("移動に時間がかかると、移動先の枠を出す", async ({ page }) => {
  await page.goto("/home");
  await page.route("**/expense-attribute**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.getByRole("link", { name: "支出属性" }).click();
  const skeleton = page.locator("[aria-busy=true]");
  await expect(skeleton).toBeVisible();
  await expect(skeleton.getByRole("status")).toHaveText("読み込み中");
  await expect(page).toHaveURL(/\/expense-attribute/);
  await expect(skeleton).toHaveCount(0);
});

test("読み込めないときは、表の見出しの下にエラーを出す", async ({ page }) => {
  await page.goto("/expense?year=2026&category=固定費&attributeId=missing");
  const alert = page
    .getByRole("alert")
    .filter({ hasText: "読み込めませんでした" });
  await expect(alert).toContainText("読み込めませんでした");
  await expect(
    alert.getByRole("button", { name: "もう一度試す" }),
  ).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "説明" })).toBeVisible();
});

test("削除済みの編集画面は「見つかりませんでした」を出す", async ({ page }) => {
  const response = await page.goto(
    "/expense/00000000-0000-0000-0000-000000000000",
  );
  expect(response?.status()).toBe(404);
  await expect(page.getByText("この支出は見つかりませんでした")).toBeVisible();
  await page.getByRole("link", { name: "支出の一覧に戻る" }).click();
  await expect(page).toHaveURL(/\/expense$/);
});

test.describe("幅 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("メニューのボタンでナビゲーションを開き、移動すると閉じる", async ({
    page,
  }) => {
    await page.goto("/expense?year=2026&month=3");
    const button = page.getByRole("button", { name: "メニュー" });
    const menu = page.locator("#site-menu");
    await expect(menu).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "収入", exact: true }).click();
    await expect(page).toHaveURL(/\/income/);
    await expect(menu).toBeHidden();
  });

  test("少しスクロールしてヘッダーが見えなくなると「ページの先頭へ」を出し、押すと先頭に戻って本文にフォーカスを移す", async ({
    page,
  }) => {
    await page.goto("/expense?year=2025");
    const button = page.getByRole("button", { name: "ページの先頭へ" });
    await expect(button).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("main")).toBeFocused();
    await expect(button).toHaveCount(0);
  });
});

test.describe("タブレット（幅 1024px、タッチ）", () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });

  test("ページ全体がスクロールし、表の見出しは画面の上に残る", async ({
    page,
  }) => {
    await page.goto("/expense?year=2026&month=3");
    const inner = await page.evaluate(() =>
      [...document.querySelectorAll("body *")].filter((element) => {
        const style = getComputedStyle(element);
        return (
          /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`) &&
          (element.scrollHeight > element.clientHeight + 1 ||
            element.scrollWidth > element.clientWidth + 1)
        );
      }).length,
    );
    expect(inner).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect
      .poll(() =>
        page
          .getByRole("columnheader", { name: "説明" })
          .evaluate((th) => Math.round(th.getBoundingClientRect().top)),
      )
      .toBe(0);
    await expect(
      page.getByRole("button", { name: "ページの先頭へ" }),
    ).toBeVisible();
  });

  test("サイドバーはたたんであり、メニューのボタンで重ねて開き、外を押すか Esc で閉じる", async ({
    page,
  }) => {
    await page.goto("/expense?year=2026&month=3");
    const button = page.getByRole("button", { name: "メニュー" });
    const menu = page.locator("#site-menu");
    await expect(menu).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await page.mouse.click(800, 600);
    await expect(menu).toBeHidden();
    await button.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
    await button.click();
    await menu.getByRole("link", { name: "収入", exact: true }).click();
    await expect(page).toHaveURL(/\/income/);
    await expect(menu).toBeHidden();
  });
});

test.describe("タブレット（幅 1366px、タッチ）", () => {
  test.use({ viewport: { width: 1366, height: 1024 }, hasTouch: true });

  test("サイドバーを出したまま、ページ全体がスクロールする", async ({
    page,
  }) => {
    await page.goto("/home?year=2026&month=3");
    await expect(page.locator("#site-menu")).toBeVisible();
    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight,
    );
    expect(scrollable).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect
      .poll(() =>
        page
          .locator("#site-menu")
          .evaluate((menu) => Math.round(menu.getBoundingClientRect().top)),
      )
      .toBe(32);
  });
});

test("幅 1440px でメニューのボタンを押すとサイドメニューを隠し、読み直しても隠したままにする", async ({
  page,
}) => {
  await page.goto("/home");
  const button = page.getByRole("button", { name: "メニュー" });
  const menu = page.locator("#site-menu");
  await expect(menu).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.click();
  await expect(menu).toBeHidden();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await page.reload();
  await expect(menu).toBeHidden();
  await button.click();
  await expect(menu).toBeVisible();
});

test("幅 1440px では「ページの先頭へ」を出さない", async ({ page }) => {
  await page.goto("/expense?year=2025");
  await page
    .locator("main")
    .evaluate((main) => main.scrollTo(0, main.scrollHeight));
  await expect(
    page.getByRole("button", { name: "ページの先頭へ" }),
  ).toHaveCount(0);
});

for (const { path, label, from, to } of [
  { path: "/expense?year=2026", label: "年", from: "2026", to: "2025" },
  { path: "/income?year=2026", label: "年", from: "2026", to: "2025" },
  { path: "/home?year=2026&month=3", label: "年", from: "2026", to: "2025" },
  { path: "/annual-report?year=2026", label: "年", from: "2026", to: "2025" },
  {
    path: "/expense-attribute?category=固定費",
    label: "分類",
    from: "固定費",
    to: "変動費",
  },
]) {
  test(`${path} で絞り込みを変えてから戻ると、絞り込みも元に戻る`, async ({
    page,
  }) => {
    await page.goto(path);
    const combobox = page.getByRole("combobox", { name: label, exact: true });
    await combobox.click();
    await page.getByRole("option", { name: to, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(encodeURIComponent(to)));
    await expect(combobox).toHaveText(to);
    await page.goBack();
    await expect(page).not.toHaveURL(new RegExp(encodeURIComponent(to)));
    await expect(combobox).toHaveText(from);
  });
}

test("削除のダイアログは、読み込み中を出してから押した行の内容を出す", async ({
  page,
}) => {
  await page.goto("/expense?year=2026&month=3");
  const rows = page.locator("main tbody tr");
  const dialog = page.getByRole("dialog", { name: "支出の削除" });
  const remove = dialog.getByRole("button", { name: "削除" });
  for (const index of [0, 1]) {
    const description = await rows.nth(index).locator("td").nth(1).innerText();
    await page.route("**/*", async (route) => {
      if (route.request().method() === "POST")
        await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });
    await rows
      .nth(index)
      .getByRole("button", { name: `${description}を削除` })
      .click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("読み込み中…")).toBeVisible();
    await expect(remove).toBeDisabled();
    await expect(dialog.locator("dd").first()).toHaveText(description);
    await expect(remove).toBeEnabled();
    await page.unroute("**/*");
    await dialog.getByRole("button", { name: "キャンセル" }).click();
    await expect(dialog).toBeHidden();
  }
});

test.describe("幅 390px の表", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  for (const path of [
    "/expense?year=2026&month=3",
    "/income?year=2025",
    "/expense-attribute",
    "/income-attribute",
    "/annual-report?year=2026",
  ]) {
    test(`${path} の表は横にスクロールしない`, async ({ page }) => {
      await page.goto(path);
      const scroll = page.locator("main table").first().locator("..");
      await expect(scroll).toBeVisible();
      expect(
        await scroll.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
    });
  }

  test("支出の行は、説明・金額と、日付・属性名・分類と、編集・削除を出す", async ({
    page,
  }) => {
    await page.goto("/expense?year=2026&month=3");
    const row = page.locator("main tbody tr").first();
    await expect(row.locator("[data-mobile='hide']")).toBeHidden();
    await expect(row.getByRole("button", { name: /を編集$/ })).toBeVisible();
    await expect(row.getByRole("button", { name: /を削除$/ })).toBeVisible();
    const title = await row.locator("[data-mobile='title']").boundingBox();
    const date = await row.locator("[data-mobile='date']").boundingBox();
    expect((date?.y ?? 0) > (title?.y ?? 0)).toBe(true);
  });

  test("属性の行は「…」のメニューから並べ替え・編集・削除をする", async ({
    page,
  }) => {
    await page.goto("/expense-attribute");
    const first = page.locator("main tbody tr").first();
    const name = (
      await first.locator("[data-mobile='name']").innerText()
    ).trim();
    await expect(
      first.getByRole("button", { name: `${name}を編集` }),
    ).toBeHidden();
    const trigger = first.getByRole("button", { name: `${name}の操作` });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "上へ移動" })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("button", { name: "編集", exact: true }).click();
    await expect(page).toHaveURL(/\/expense-attribute\/[^/?]+/);
  });
});
