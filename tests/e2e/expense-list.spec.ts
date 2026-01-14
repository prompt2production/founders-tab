import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Expense List & Filtering', () => {
  let testUser = {
    name: 'Expense List User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `expense-list-${Date.now()}@example.com`

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

  test('should navigate to expenses page via navigation link', async ({ page }) => {
    // Click Expenses link in navigation
    await page.click('a[href="/expenses"]')

    // Verify we're on the expenses page
    await page.waitForURL('/expenses', { timeout: 10000 })
    await expect(page.locator('h1:has-text("Expenses")')).toBeVisible()
  })

  test('should show filter controls on expenses page', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Verify filter controls are visible
    await expect(page.locator('text=All Members')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Select dates')).toBeVisible()
    await expect(page.locator('text=All Categories')).toBeVisible()
  })

  test('should show Add Expense button on expenses page', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Verify Add Expense button is visible
    await expect(page.locator('button:has-text("Add Expense")')).toBeVisible()
  })

  test('should open add expense sheet when clicking Add Expense', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click Add Expense button
    await page.click('button:has-text("Add Expense")')

    // Verify sheet opens
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible()
    await expect(page.locator('[data-slot="sheet-title"]')).toHaveText('Add Expense')
  })

  test('should filter by category', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click category filter dropdown
    await page.click('button:has-text("All Categories")')

    // Wait for dropdown to open and select a category
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Food & Dining")')

    // Verify URL updated with category param
    await expect(page).toHaveURL(/category=FOOD/)
  })

  test('should filter by date range preset', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click date range filter
    await page.click('button:has-text("Select dates")')

    // Wait for popover to open
    await page.waitForSelector('button:has-text("This Month")', { timeout: 5000 })

    // Click This Month preset
    await page.click('button:has-text("This Month")')

    // Verify URL updated with date params
    await expect(page).toHaveURL(/startDate=/)
    await expect(page).toHaveURL(/endDate=/)
  })

  test('should clear filters with Clear All button', async ({ page }) => {
    // Navigate to expenses page with a filter applied
    await page.goto('/expenses?category=FOOD')

    // Wait for page to load
    await expect(page.locator('h1:has-text("Expenses")')).toBeVisible()

    // Should show "1 filter active" badge
    await expect(page.locator('text=1 filter active')).toBeVisible({ timeout: 5000 })

    // Click Clear All
    await page.click('button:has-text("Clear All")')

    // Verify URL no longer has category param
    await expect(page).toHaveURL('/expenses')
  })
})
