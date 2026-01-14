import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Balance Approval Integration', () => {
  let testUser = {
    name: 'Balance Approval User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `balance-approval-${Date.now()}@example.com`

    const page = await browser.newPage()
    await page.goto('/signup')
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })
  })

  test('balance page should be accessible', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Verify we're on the balance page
    await expect(page.locator('h1:has-text("Running Balances")')).toBeVisible({ timeout: 5000 })
  })

  test('balance page should show content structure', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Should see the main heading
    await expect(page.locator('h1:has-text("Running Balances")')).toBeVisible({ timeout: 5000 })

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Should see some content (either balance summary/cards or empty state)
    const hasContent = await page.locator('.rounded-xl').count() > 0
    const hasEmptyState = await page.locator('text=No balances yet').count() > 0
    expect(hasContent || hasEmptyState).toBeTruthy()
  })

  test('balance page should navigate via navigation link', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Click on Balances link in navigation
    await page.click('a[href="/balance"]')

    // Verify we navigated to balance page
    await page.waitForURL('/balance', { timeout: 5000 })
    await expect(page.locator('h1:has-text("Running Balances")')).toBeVisible()
  })

  test('balance page should have correct heading', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // The heading should say "Running Balances"
    const heading = page.locator('h1')
    await expect(heading).toContainText('Balances', { timeout: 5000 })
  })
})
