import { expect, type Page, test } from "@playwright/test";

const openStory = async (page: Page, id: string) => {
  await page.goto(`/iframe.html?id=components-select--${id}&viewMode=story`);
  await page.locator("#storybook-root > *").first().waitFor();
};

const parts = (page: Page, name: string) => ({
  box: page.getByRole("combobox", { name }),
  listbox: page.getByRole("listbox", { name }),
  native: page.locator("#storybook-root select"),
  option: (label: string) =>
    page.getByRole("option", { name: label, exact: true }),
});

const activeLabel = (page: Page, name: string) =>
  parts(page, name).box.evaluate((box) => {
    const id = box.getAttribute("aria-activedescendant");
    return id ? (document.getElementById(id)?.textContent ?? null) : null;
  });

const countChanges = (page: Page) =>
  page.locator("#storybook-root select").evaluate((select) => {
    Object.assign(window, { changes: 0 });
    select.addEventListener("change", () => {
      Object.assign(window, { changes: Reflect.get(window, "changes") + 1 });
    });
  });

const changes = (page: Page) =>
  page.evaluate(() => Reflect.get(window, "changes") as number);

test.describe("値（HTML の select）", () => {
  test("S1 初期値の選択肢を表示し、フォームでその値を送る", async ({
    page,
  }) => {
    await openStory(page, "in-form");
    await expect(parts(page, "分類").box).toHaveText("固定費");
    await page.getByRole("button", { name: "送る" }).click();
    await expect(page.locator("output")).toHaveText("送った値: 固定費");
  });

  test("S2 選ぶと送る値が変わり change が 1 回起き、同じ値では起きない", async ({
    page,
  }) => {
    await openStory(page, "default");
    const { box, native, option } = parts(page, "分類");
    await countChanges(page);
    await box.click();
    await option("変動費").click();
    await expect(box).toHaveText("変動費");
    await expect(native).toHaveValue("変動費");
    await box.click();
    await option("変動費").click();
    expect(await changes(page)).toBe(1);
  });

  test("S3 value を渡したときは、onChange で親の値が変わると表示も変わる", async ({
    page,
  }) => {
    await openStory(page, "controlled");
    const { box, option } = parts(page, "分類");
    await box.click();
    await option("変動費").click();
    await expect(page.locator("output")).toHaveText("値: 変動費");
    await expect(box).toHaveText("変動費");
  });

  test("S4 使えない選択肢は選べず、キーでの移動でも飛ばす", async ({
    page,
  }) => {
    await openStory(page, "with-disabled-option");
    const { box, option } = parts(page, "属性名");
    await box.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeLabel(page, "属性名")).toBe("食費");
    await expect(option("電気（使えません）")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await option("電気（使えません）").click({ force: true });
    await expect(box).toHaveText("家賃");
  });

  test("S5 disabled のときは開けない", async ({ page }) => {
    await openStory(page, "disabled");
    await expect(parts(page, "分類").box).toBeDisabled();
  });

  test("S6 フォームを元に戻すと初期値に戻る", async ({ page }) => {
    await openStory(page, "in-form");
    const { box, native, option } = parts(page, "分類");
    await box.click();
    await option("変動費").click();
    await page.getByRole("button", { name: "元に戻す" }).click();
    await expect(box).toHaveText("固定費");
    await expect(native).toHaveValue("固定費");
  });
});

test.describe("キーボード（WAI-ARIA Select-Only Combobox）", () => {
  for (const key of ["ArrowDown", "ArrowUp", "Enter", " "]) {
    test(`K1 閉じているとき ${key === " " ? "Space" : key} で開き、選んでいる選択肢を示す`, async ({
      page,
    }) => {
      await openStory(page, "many-options");
      const { box, listbox } = parts(page, "年");
      await box.focus();
      await page.keyboard.press(key);
      await expect(listbox).toBeVisible();
      await expect(box).toHaveAttribute("aria-expanded", "true");
      expect(await activeLabel(page, "年")).toBe("2026年");
    });
  }

  test("K2 Home・End で開き、最初・最後の選択肢へ移る", async ({ page }) => {
    await openStory(page, "many-options");
    const { box } = parts(page, "年");
    await box.focus();
    await page.keyboard.press("End");
    expect(await activeLabel(page, "年")).toBe("2030年");
    await page.keyboard.press("Home");
    expect(await activeLabel(page, "年")).toBe("2015年");
  });

  test("K3 開いているとき ↑↓ で 1 つ、PageUp・PageDown で 10 個移り、端で止まる", async ({
    page,
  }) => {
    await openStory(page, "many-options");
    const { box, option } = parts(page, "年");
    await box.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeLabel(page, "年")).toBe("2027年");
    await page.keyboard.press("PageUp");
    expect(await activeLabel(page, "年")).toBe("2017年");
    await page.keyboard.press("PageUp");
    expect(await activeLabel(page, "年")).toBe("2015年");
    await page.keyboard.press("ArrowUp");
    expect(await activeLabel(page, "年")).toBe("2015年");
    await page.keyboard.press("End");
    await expect(option("2030年")).toBeInViewport();
  });

  for (const key of ["Enter", " ", "Alt+ArrowUp"]) {
    test(`K4 ${key === " " ? "Space" : key} で選んで閉じ、フォーカスはコンボボックスのまま`, async ({
      page,
    }) => {
      await openStory(page, "many-options");
      const { box, listbox, native } = parts(page, "年");
      await box.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press(key);
      await expect(listbox).toBeHidden();
      await expect(box).toHaveText("2027年");
      await expect(native).toHaveValue("2027");
      await expect(box).toBeFocused();
    });
  }

  test("K5 Esc で値を変えずに閉じる", async ({ page }) => {
    await openStory(page, "many-options");
    const { box, listbox } = parts(page, "年");
    await box.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();
    await expect(box).toHaveText("2026年");
    await expect(box).toBeFocused();
  });

  test("K6 Tab で今の選択肢を選んで閉じる", async ({ page }) => {
    await openStory(page, "many-options");
    const { box, listbox } = parts(page, "年");
    await box.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    await expect(listbox).toBeHidden();
    await expect(box).toHaveText("2027年");
  });

  test("K7 文字を続けて打つと、その文字で始まる選択肢へ移る", async ({
    page,
  }) => {
    await openStory(page, "many-options");
    const { box } = parts(page, "年");
    await box.focus();
    await page.keyboard.type("2019");
    expect(await activeLabel(page, "年")).toBe("2019年");
  });
});

test.describe("位置", () => {
  for (const how of ["click", "ArrowDown"]) {
    test(`P1 開いたとき（${how === "click" ? "押す" : "↓"}）は、選んでいる選択肢を一覧の真ん中に出す`, async ({
      page,
    }) => {
      await openStory(page, "many-options");
      const { box, listbox, option } = parts(page, "年");
      if (how === "click") await box.click();
      else {
        await box.focus();
        await page.keyboard.press("ArrowDown");
      }
      await expect(listbox).toBeVisible();
      await expect(async () => {
        const list = await listbox.boundingBox();
        const selected = await option("2026年").boundingBox();
        if (!list || !selected) throw new Error("no box");
        const listCenter = list.y + list.height / 2;
        const optionCenter = selected.y + selected.height / 2;
        expect(Math.abs(listCenter - optionCenter)).toBeLessThan(
          selected.height / 2,
        );
      }).toPass();
    });
  }
});

test.describe("マウス", () => {
  test("M1 押すと開き、選択肢を押すと選んで閉じる", async ({ page }) => {
    await openStory(page, "default");
    const { box, listbox, option } = parts(page, "分類");
    await box.click();
    await expect(listbox).toBeVisible();
    await option("変動費").click();
    await expect(listbox).toBeHidden();
    await expect(box).toHaveText("変動費");
  });

  test("M2 外を押すと値を変えずに閉じる", async ({ page }) => {
    await openStory(page, "default");
    const { box, listbox } = parts(page, "分類");
    await box.click();
    await expect(listbox).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(listbox).toBeHidden();
    await expect(box).toHaveText("固定費");
  });
});

test.describe("読み上げ（WAI-ARIA Select-Only Combobox）", () => {
  test("A1 コンボボックスはラベルを名前にし、一覧を開くことと開いているかを伝える", async ({
    page,
  }) => {
    await openStory(page, "default");
    const { box, listbox } = parts(page, "分類");
    await expect(box).toHaveAttribute("aria-haspopup", "listbox");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await box.click();
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await expect(box).toHaveAttribute(
      "aria-controls",
      (await listbox.getAttribute("id")) ?? "",
    );
  });

  test("A2 選んでいる選択肢を aria-selected で伝え、ラベルのない欄は aria-label を名前にする", async ({
    page,
  }) => {
    await openStory(page, "default");
    const { box, option } = parts(page, "分類");
    await box.click();
    await expect(option("固定費")).toHaveAttribute("aria-selected", "true");
    await expect(option("変動費")).toHaveAttribute("aria-selected", "false");

    await openStory(page, "without-label");
    await expect(parts(page, "年月").box).toHaveText("2024年10月");
  });
});
