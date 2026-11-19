import { expect, type Page, test } from "@playwright/test";

const TODAY = new Date("2026-11-20T10:00:00+09:00");

const openStory = async (page: Page, id: string, args = "") => {
  await page.clock.setFixedTime(TODAY);
  await page.goto(
    `/iframe.html?id=components-${id}&viewMode=story${args ? `&args=${args}` : ""}`,
  );
  await page.locator("#storybook-root > *").first().waitFor();
};

const parts = (page: Page) => {
  const dialog = page.getByRole("dialog");
  return {
    input: page.getByLabel("支払日", { exact: true }),
    toggle: page.getByRole("button", { name: "カレンダーを開く" }),
    dialog,
    title: dialog.locator('[data-part="title"]'),
    day: (name: string) => dialog.getByRole("button", { name, exact: true }),
  };
};

const openCalendar = async (page: Page, value?: string) => {
  const { input, toggle, dialog } = parts(page);
  if (value !== undefined) await input.fill(value);
  await toggle.click();
  await expect(dialog.locator(":focus")).toHaveCount(1);
};

test.describe("値と属性（HTML の input type=date）", () => {
  test("V1 選ぶと、欄の value が YYYY-MM-DD になり、input と change が 1 回ずつ起きる", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    const { input, day } = parts(page);
    await input.evaluate((element) => {
      const counts = { input: 0, change: 0 };
      element.addEventListener("input", () => counts.input++);
      element.addEventListener("change", () => counts.change++);
      Object.assign(window, { counts });
    });
    await openCalendar(page);
    await day("2026年11月25日 水曜日").click();
    await expect(input).toHaveValue("2026-11-25");
    expect(await page.evaluate(() => Reflect.get(window, "counts"))).toEqual({
      input: 1,
      change: 1,
    });
  });

  test("V2 値が空のときは、今日の月を開き、今日にフォーカスする", async ({
    page,
  }) => {
    await openStory(page, "dateinput--empty");
    await openCalendar(page);
    const { title, day } = parts(page);
    await expect(title).toHaveText("2026年11月");
    await expect(day("2026年11月20日 金曜日")).toBeFocused();
  });

  test("V3 値があるときは、その日の月を開き、その日を選択済みにしてフォーカスする", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page, "2027-03-05");
    const { title, day } = parts(page);
    await expect(title).toHaveText("2027年3月");
    await expect(day("2027年3月5日 金曜日")).toBeFocused();
    await expect(day("2027年3月5日 金曜日")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("V4 min・max の外の日は選べず、外の月へは移れない", async ({ page }) => {
    await openStory(page, "dateinput--with-range");
    await openCalendar(page, "2026-11-10");
    const { input, dialog, day } = parts(page);
    await expect(day("2026年11月9日 月曜日")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await day("2026年11月9日 月曜日").focus();
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("2026-11-10");
    await expect(dialog.getByRole("button", { name: "前の月" })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "次の月" })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await expect(day("2026年11月10日 火曜日")).toBeFocused();
  });

  test("V5 step に合わない日は選べない（基準は min）", async ({ page }) => {
    await openStory(page, "dateinput--with-step");
    await openCalendar(page);
    const { input, day } = parts(page);
    await expect(day("2026年11月17日 火曜日")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await day("2026年11月17日 火曜日").focus();
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("2026-11-16");
    await day("2026年11月23日 月曜日").click();
    await expect(input).toHaveValue("2026-11-23");
  });

  test("V6 readonly のときは、カレンダーを開けない", async ({ page }) => {
    await openStory(page, "dateinput--read-only");
    await expect(parts(page).toggle).toBeDisabled();
  });

  test("V7 disabled のときは、カレンダーを開けない", async ({ page }) => {
    await openStory(page, "dateinput--disabled");
    await expect(parts(page).toggle).toBeDisabled();
  });

  test("V8 required でなければ「クリア」で空にでき、required なら「クリア」を出さない", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    await parts(page).dialog.getByRole("button", { name: "クリア" }).click();
    await expect(parts(page).input).toHaveValue("");

    await openStory(page, "dateinput--required");
    await openCalendar(page);
    await expect(
      parts(page).dialog.getByRole("button", { name: "クリア" }),
    ).toHaveCount(0);
  });

  test("V9 0001-01-01 から 275760-09-13 までを扱い、その外へは移れない", async ({
    page,
  }) => {
    await openStory(page, "calendar--limits");
    const title = page.locator('[data-part="title"]');
    await expect(title).toHaveText("1年1月");
    await expect(page.getByRole("button", { name: "前の月" })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "1年1月1日 月曜日", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    await openStory(page, "calendar--default", "value:275760-09-13");
    await expect(title).toHaveText("275760年9月");
    await expect(page.getByRole("button", { name: "次の月" })).toBeDisabled();
    await expect(page.locator('[data-focus-key="275760-09-14"]')).toHaveCount(
      0,
    );
  });
});

test.describe("キーボードとフォーカス（WAI-ARIA Date Picker Dialog）", () => {
  test("K1 矢印キーで前後の日と前後の週に移り、月をまたぐと月が変わる", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { title, day } = parts(page);
    for (const [key, name] of [
      ["ArrowRight", "2026年11月21日 土曜日"],
      ["ArrowDown", "2026年11月28日 土曜日"],
      ["ArrowLeft", "2026年11月27日 金曜日"],
      ["ArrowUp", "2026年11月20日 金曜日"],
    ] as const) {
      await page.keyboard.press(key);
      await expect(day(name)).toBeFocused();
    }
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(title).toHaveText("2026年12月");
    await expect(day("2026年12月4日 金曜日")).toBeFocused();
  });

  test("K2 Home・End で週の始めと終わりに移る（週の始まりに従う）", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { day } = parts(page);
    await page.keyboard.press("Home");
    await expect(day("2026年11月15日 日曜日")).toBeFocused();
    await page.keyboard.press("End");
    await expect(day("2026年11月21日 土曜日")).toBeFocused();

    await openStory(page, "calendar--week-starts-on-monday");
    await page.getByRole("button", { name: "2026年11月20日 金曜日" }).focus();
    await page.keyboard.press("Home");
    await expect(
      page.getByRole("button", { name: "2026年11月16日 月曜日" }),
    ).toBeFocused();
  });

  test("K3 PageUp・PageDown で前後の月に移り、日がなければ月末にする", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page, "2026-01-31");
    const { day } = parts(page);
    await page.keyboard.press("PageDown");
    await expect(day("2026年2月28日 土曜日")).toBeFocused();
    await page.keyboard.press("PageUp");
    await expect(day("2026年1月28日 水曜日")).toBeFocused();
  });

  test("K4 Shift を付けると前後の年に移る", async ({ page }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page, "2028-02-29");
    const { day } = parts(page);
    await page.keyboard.press("Shift+PageDown");
    await expect(day("2029年2月28日 水曜日")).toBeFocused();
    await page.keyboard.press("Shift+PageUp");
    await expect(day("2028年2月28日 月曜日")).toBeFocused();
  });

  for (const key of ["Enter", " "]) {
    test(`K5 ${key === " " ? "Space" : key} で選び、閉じて、開いたボタンにフォーカスを戻す`, async ({
      page,
    }) => {
      await openStory(page, "dateinput--default");
      await openCalendar(page);
      const { input, toggle, dialog } = parts(page);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press(key);
      await expect(input).toHaveValue("2026-11-21");
      await expect(dialog).toBeHidden();
      await expect(toggle).toBeFocused();
    });
  }

  test("K6 Esc で値を変えずに閉じ、開いたボタンにフォーカスを戻す", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { input, toggle, dialog } = parts(page);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(input).toHaveValue("2026-11-20");
    await expect(toggle).toBeFocused();
  });

  test("K7 外を押すと値を変えずに閉じる", async ({ page }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { input, dialog } = parts(page);
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
    await expect(input).toHaveValue("2026-11-20");
  });

  test("K8 前の月・次の月のボタンで月を移る", async ({ page }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { dialog, title } = parts(page);
    await dialog.getByRole("button", { name: "次の月" }).click();
    await expect(title).toHaveText("2026年12月");
    await dialog.getByRole("button", { name: "前の月" }).click();
    await dialog.getByRole("button", { name: "前の月" }).click();
    await expect(title).toHaveText("2026年10月");
  });

  test("K9 見出しを押すと月を選ぶ画面になり、選ぶと日の表に戻る", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page);
    const { dialog, title, day } = parts(page);
    await title.click();
    await expect(title).toHaveText("2026年");
    await expect(
      dialog.getByRole("button", { name: "2026年11月", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(
      dialog.getByRole("button", { name: "2027年1月", exact: true }),
    ).toBeFocused();
    await dialog.getByRole("button", { name: "次の年" }).click();
    await dialog
      .getByRole("button", { name: "2028年3月", exact: true })
      .click();
    await expect(title).toHaveText("2028年3月");
    await expect(day("2028年3月1日 水曜日")).toBeFocused();
  });

  test("K10 「今日」で今日を選んで閉じる", async ({ page }) => {
    await openStory(page, "dateinput--empty");
    await openCalendar(page);
    const { input, dialog } = parts(page);
    await dialog.getByRole("button", { name: "今日" }).click();
    await expect(input).toHaveValue("2026-11-20");
    await expect(dialog).toBeHidden();
  });
});

test.describe("読み上げ（WAI-ARIA Date Picker Dialog）", () => {
  test("A1 開くボタンは dialog を開くと伝え、開いているかを伝える", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    const { toggle } = parts(page);
    await expect(toggle).toHaveAttribute("aria-haspopup", "dialog");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await openCalendar(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("dialog", { name: "支払日を選ぶ" }),
    ).toBeVisible();
  });

  test("A2 日は年月日と曜日で読み、今日と選んだ日を伝える", async ({
    page,
  }) => {
    await openStory(page, "dateinput--default");
    await openCalendar(page, "2026-11-25");
    const { dialog, day } = parts(page);
    await expect(day("2026年11月20日 金曜日")).toHaveAttribute(
      "aria-current",
      "date",
    );
    await expect(day("2026年11月25日 水曜日")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      dialog.getByRole("table", { name: "2026年11月" }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("columnheader", { name: "日" }),
    ).toHaveAttribute("abbr", "日曜日");
  });
});

test.describe("タッチの画面", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("T1 自前のボタンを出さず、OS のピッカーに任せる", async ({ page }) => {
    await openStory(page, "dateinput--default");
    await expect(parts(page).toggle).toBeHidden();
  });
});
