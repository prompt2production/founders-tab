import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    // Update this assertion based on your app
    await expect(page.locator('body')).toBeVisible()
  })
})
