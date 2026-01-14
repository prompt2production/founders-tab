import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Balance Dashboard', () => {
  let testUser = {
    name: 'Balance User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `balance-${Date.now()}@example.com`

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

  test('should navigate to balance page via navigation link', async ({ page }) => {
    // Click Balances link in navigation
    await page.click('a[href="/balance"]')

    // Verify we're on the balance page
    await page.waitForURL('/balance', { timeout: 10000 })
    await expect(page.locator('h1:has-text("Running Balances")')).toBeVisible()
  })

  test('should display team summary on balance page', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Verify team summary is visible
    await expect(page.locator('text=Total Team Expenses')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Team Members')).toBeVisible()
    await expect(page.locator('text=Average per Founder')).toBeVisible()
  })

  test('should display balance cards for team members', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Wait for page to load
    await expect(page.locator('h1:has-text("Running Balances")')).toBeVisible()

    // Wait for loading to complete and balance cards to appear
    // At minimum, the current user should have a card
    await page.waitForSelector('[role="button"]', { timeout: 10000 })
  })

  test('should open detail sheet when clicking a balance card', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Wait for balance cards to load
    await page.waitForSelector('[role="button"]', { timeout: 10000 })

    // Click the first balance card
    await page.click('[role="button"]')

    // Verify sheet opens with breakdown content
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=By Category')).toBeVisible()
    await expect(page.locator('text=Monthly Trend')).toBeVisible()
  })

  test('should show View Expenses link in detail sheet', async ({ page }) => {
    // Navigate to balance page
    await page.goto('/balance')

    // Wait for balance cards to load
    await page.waitForSelector('[role="button"]', { timeout: 10000 })

    // Click the first balance card
    await page.click('[role="button"]')

    // Verify View Expenses link is present
    await expect(page.locator('a:has-text("View Expenses")')).toBeVisible({ timeout: 5000 })
  })
})
