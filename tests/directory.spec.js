import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const API_URL = "https://jsonplaceholder.typicode.com/users";
// Controlled API responses make loading, empty, and failure states reproducible.
const people = [
  {
    id: 1,
    name: "Leanne Graham",
    email: "Sincere@april.biz",
    address: { city: "Gwenborough" },
    company: { name: "Romaguera-Crona" },
    website: "hildegard.org",
  },
  {
    id: 2,
    name: "Ervin Howell",
    email: "Shanna@melissa.tv",
    address: { city: "Wisokyburgh" },
    company: { name: "Deckow-Crist" },
    website: "anastasia.net",
  },
  {
    id: 3,
    name: "Clementine Bauch",
    email: "Nathan@yesenia.net",
    address: { city: "McKenziehaven" },
    company: { name: "Romaguera-Jacobson" },
    website: "ramiro.info",
  },
];

async function mockPeople(page, data = people) {
  await page.route(API_URL, (route) => route.fulfill({ json: data }));
  await page.goto("/");
}

test("shows loading skeletons until the API responds", async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(API_URL, async (route) => {
    await gate;
    await route.fulfill({ json: people });
  });
  await page.goto("/");
  await expect(page.getByText("Fetching the directory...")).toBeVisible();
  await expect(page.locator(".skeleton")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Refresh directory" }),
  ).toBeDisabled();
  release();
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(page.getByText("Fetching the directory...")).toHaveCount(0);
});

test("displays every required user field and safe working links", async ({
  page,
}) => {
  await mockPeople(page);
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Leanne Graham" }) });
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(
    card.getByRole("link", { name: "Sincere@april.biz" }),
  ).toHaveAttribute("href", "mailto:Sincere@april.biz");
  await expect(
    card.getByText("Romaguera-Crona", { exact: true }),
  ).toBeVisible();
  await expect(
    card.locator("dd").filter({ hasText: "Gwenborough" }),
  ).toBeVisible();
  await expect(card.getByText("hildegard.org", { exact: true })).toBeVisible();
  await expect(
    card.getByRole("link", { name: /Visit website for Leanne/ }),
  ).toHaveAttribute("href", "https://hildegard.org/");
  await expect(
    card.getByRole("link", { name: /Visit website for Leanne/ }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByText("Showing 3 of 3 people")).toBeVisible();
});

for (const [field, query, name] of [
  ["name", "  LEANNE  ", "Leanne Graham"],
  ["email", "shanna@melissa", "Ervin Howell"],
  ["city", "mckenzie", "Clementine Bauch"],
  ["company", "deckow", "Ervin Howell"],
]) {
  test(`searches by ${field}, case-insensitively`, async ({ page }) => {
    await mockPeople(page);
    await page.getByRole("searchbox").fill(query);
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Showing 1 of 3 people")).toBeVisible();
  });
}

test("city filter works alone and combines with search; clear resets both", async ({
  page,
}) => {
  await mockPeople(page);
  const filter = page.getByLabel("Filter by city");
  await expect(filter.locator("option")).toHaveText([
    "All cities",
    "Gwenborough",
    "McKenziehaven",
    "Wisokyburgh",
  ]);
  await filter.selectOption("Wisokyburgh");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Ervin Howell", exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("Leanne");
  await expect(
    page.getByRole("heading", { name: "No people found." }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page
    .locator(".directory-state")
    .getByRole("button", { name: "Clear filters" })
    .click();
  await expect(filter).toHaveValue("");
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(3);
});

test("shows a useful empty search state and clear action", async ({ page }) => {
  await mockPeople(page);
  await page.getByRole("searchbox").fill("no-such-person-123");
  await expect(
    page.getByRole("heading", { name: "No people found." }),
  ).toBeVisible();
  await expect(page.getByText("Showing 0 of 3 people")).toBeVisible();
  await page
    .locator(".results-toolbar")
    .getByRole("button", { name: "Clear filters" })
    .click();
  await expect(page.getByRole("article")).toHaveCount(3);
});

test("handles an empty API response and allows refreshing", async ({
  page,
}) => {
  let calls = 0;
  await page.route(API_URL, (route) =>
    route.fulfill({ json: calls++ === 0 ? [] : people }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "No people here just yet." }),
  ).toBeVisible();
  await page
    .locator(".directory-state")
    .getByRole("button", { name: "Refresh directory" })
    .click();
  await expect(page.getByRole("article")).toHaveCount(3);
});

for (const failure of ["http", "network", "invalid-json", "invalid-shape"]) {
  test(`${failure} failure shows error and Retry successfully refetches`, async ({
    page,
  }) => {
    let calls = 0;
    await page.route(API_URL, (route) => {
      if (calls++ > 0) return route.fulfill({ json: people });
      if (failure === "network") return route.abort("failed");
      if (failure === "http")
        return route.fulfill({ status: 503, body: "Service unavailable" });
      if (failure === "invalid-json")
        return route.fulfill({
          contentType: "application/json",
          body: "not json",
        });
      return route.fulfill({ json: [{ id: 1, name: null }] });
    });
    await page.goto("/");
    await expect(page.getByRole("alert")).toContainText(
      "We couldn't load the directory.",
    );
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(3);
    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(calls).toBe(2);
  });
}

test("a stalled API request times out and can be retried", async ({ page }) => {
  await page.clock.install();
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(API_URL, async (route) => {
    calls += 1;
    if (calls === 1) await gate;
    await route.fulfill({ json: people }).catch(() => {});
  });
  await page.goto("/");
  await expect(page.getByText("Fetching the directory...")).toBeVisible();
  await page.clock.fastForward(15001);
  await expect(page.getByRole("alert")).toBeVisible();
  release();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
});

test("refresh makes another request and preserves search and city selections", async ({
  page,
}) => {
  let calls = 0;
  await page.route(API_URL, (route) => {
    calls += 1;
    return route.fulfill({ json: people });
  });
  await page.goto("/");
  await page.getByLabel("Filter by city").selectOption("Gwenborough");
  await page.getByRole("searchbox").fill("Leanne");
  await page.getByRole("button", { name: "Refresh directory" }).click();
  await expect.poll(() => calls).toBe(2);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("searchbox")).toHaveValue("Leanne");
  await expect(page.getByLabel("Filter by city")).toHaveValue("Gwenborough");
});

test("keyboard users can skip to directory, search, and select a city", async ({
  page,
}) => {
  await mockPeople(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to directory" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#directory")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Refresh directory" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("Leanne");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Filter by city")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Filter by city")).toHaveValue("Gwenborough");
});

for (const width of [320, 390, 768, 1440]) {
  test(`responsive layout at ${width}px has no horizontal overflow`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockPeople(page);
    await expect(page.getByRole("article")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const columns = await page
      .locator(".people-grid")
      .evaluate(
        (element) =>
          getComputedStyle(element).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width <= 600 ? 1 : width <= 850 ? 2 : 3);
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByLabel("Filter by city")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`directory-${width}.png`),
      fullPage: true,
    });
  });
}

test("automated accessibility scan passes for success, empty, and error states", async ({
  page,
}) => {
  await mockPeople(page);
  await expect(page.getByRole("article")).toHaveCount(3);
  for (const state of ["success", "empty", "error"]) {
    if (state === "empty")
      await page.getByRole("searchbox").fill("nonexistent-person");
    if (state === "error") {
      await page.route(API_URL, (route) => route.abort("failed"));
      await page.getByRole("button", { name: "Refresh directory" }).click();
      await expect(page.getByRole("alert")).toBeVisible();
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations, `${state} accessibility violations`).toEqual([]);
  }
});

test("live public API loads the real 10-person directory without mocks", async ({
  page,
}, testInfo) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("article")).toHaveCount(10, { timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "Leanne Graham", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Filter by city").locator("option")).toHaveCount(
    11,
  );
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("live-directory.png"),
    fullPage: true,
  });
});
