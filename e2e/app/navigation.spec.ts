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
  await expect(alert.getByRole("button", { name: "もう一度試す" })).toBeVisible();
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
