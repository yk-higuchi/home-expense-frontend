import { expect, type Page, test } from "@playwright/test";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const removeFromBackend = async (resource: string, id: string) => {
  const found = await fetch(`${BACKEND_URL}/v1/${resource}/${id}`);
  if (!found.ok) return;
  const etag = found.headers.get("etag") ?? "";
  const removed = await fetch(`${BACKEND_URL}/v1/${resource}/${id}`, {
    method: "DELETE",
    headers: { "if-match": etag },
  });
  expect(removed.ok).toBe(true);
};

const submit = async (page: Page): Promise<string> => {
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.headers()["x-action-redirect"] !== undefined,
    ),
    page.getByRole("button", { name: "登録" }).click(),
  ]);
  const redirect = response.headers()["x-action-redirect"].split(";")[0];
  return new URL(redirect, page.url()).searchParams.get("saved") ?? "";
};

const expectQuery = async (
  page: Page,
  path: string,
  query: Record<string, string>,
) => {
  await expect(page).toHaveURL(
    (url) => url.pathname === path && !url.searchParams.has("saved"),
  );
  const params = new URL(page.url()).searchParams;
  params.delete("saved");
  expect(Object.fromEntries(params)).toEqual(query);
};

const choose = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const openRegistration = async (page: Page, path: string) => {
  await page.goto(path);
  await page.getByRole("link", { name: "追加" }).click();
  await expect(page).toHaveURL(/\/registration/);
};

for (const { name, path, list, query, combobox } of [
  {
    name: "支出",
    path: "/expense?year=2025&month=3&category=変動費",
    list: "/expense",
    query: { year: "2025", month: "3", category: "変動費" },
    combobox: { label: "分類", text: "変動費" },
  },
  {
    name: "収入",
    path: "/income?year=2024",
    list: "/income",
    query: { year: "2024" },
    combobox: { label: "年", text: "2024" },
  },
  {
    name: "支出属性",
    path: "/expense-attribute?category=変動費",
    list: "/expense-attribute",
    query: { category: "変動費" },
    combobox: { label: "分類", text: "変動費" },
  },
]) {
  test(`${name}の追加画面から「戻る」で戻ると、絞り込みの条件が残る`, async ({
    page,
  }) => {
    await openRegistration(page, path);
    await page.getByRole("link", { name: "戻る" }).click();
    await expectQuery(page, list, query);
    await expect(
      page.getByRole("combobox", { name: combobox.label, exact: true }),
    ).toHaveText(combobox.text);
  });
}

test("支出の追加画面で分類を変えてから「戻る」で戻っても、絞り込みの条件が残る", async ({
  page,
}) => {
  await openRegistration(page, "/expense?year=2025&month=3&category=変動費");
  await choose(page, "分類", "変動費");
  await expect(page).toHaveURL(/category=%E5%A4%89%E5%8B%95%E8%B2%BB/);
  await page.getByRole("link", { name: "戻る" }).click();
  await expectQuery(page, "/expense", {
    year: "2025",
    month: "3",
    category: "変動費",
  });
});

test.describe("登録して一覧に戻る", () => {
  const created: { resource: string; id: string }[] = [];

  test.afterEach(async () => {
    for (const { resource, id } of created.splice(0)) {
      await removeFromBackend(resource, id);
    }
  });

  const registerExpense = async (page: Page, date: string) => {
    await page
      .getByRole("textbox", { name: "説明" })
      .fill(`e2e-${Date.now()}`);
    await page.getByRole("textbox", { name: "金額" }).fill("100");
    await page.getByRole("textbox", { name: "支払日" }).fill(date);
    created.push({ resource: "expenses", id: await submit(page) });
  };

  const registerIncome = async (page: Page, date: string) => {
    await page
      .getByRole("textbox", { name: "説明" })
      .fill(`e2e-${Date.now()}`);
    await page.getByRole("textbox", { name: "金額" }).fill("100");
    await page.getByRole("textbox", { name: "受取日" }).fill(date);
    created.push({ resource: "incomes", id: await submit(page) });
  };

  test("支出: 登録した行が今の条件で見えるなら、条件はそのまま", async ({
    page,
  }) => {
    await openRegistration(page, "/expense?year=2025&month=3&category=固定費");
    await registerExpense(page, "2025/03/15");
    await expectQuery(page, "/expense", {
      year: "2025",
      month: "3",
      category: "固定費",
    });
  });

  test("支出: 登録した行が今の条件で見えないなら、登録した年と月に切り替える", async ({
    page,
  }) => {
    await openRegistration(page, "/expense?year=2025&month=3&category=変動費");
    await registerExpense(page, "2025/04/10");
    await expectQuery(page, "/expense", { year: "2025", month: "4" });
  });

  test("収入: 登録した行が今の条件で見えるなら、条件はそのまま", async ({
    page,
  }) => {
    await openRegistration(page, "/income?year=2024");
    await registerIncome(page, "2024/06/10");
    await expectQuery(page, "/income", { year: "2024" });
  });

  test("収入: 登録した行が今の条件で見えないなら、登録した年に切り替える", async ({
    page,
  }) => {
    await openRegistration(page, "/income?year=2024");
    await registerIncome(page, "2023/06/10");
    await expectQuery(page, "/income", { year: "2023" });
  });

  test("支出属性: 登録した属性の分類の一覧に戻る", async ({ page }) => {
    await openRegistration(page, "/expense-attribute?category=固定費");
    await page
      .getByRole("textbox", { name: "属性名" })
      .fill(`e2e-${Date.now()}`);
    await choose(page, "分類", "変動費");
    created.push({ resource: "expense-attributes", id: await submit(page) });
    await expectQuery(page, "/expense-attribute", { category: "変動費" });
  });
});
