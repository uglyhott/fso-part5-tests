import { expect, test } from "@playwright/test"

test.describe("Blog App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Log in to application" })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
})
