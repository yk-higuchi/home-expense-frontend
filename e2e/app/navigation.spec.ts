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
