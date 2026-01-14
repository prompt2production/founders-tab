import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Expense Approval Flow', () => {
  let testUser = {
    name: 'Approval Test User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `approval-test-${Date.now()}@example.com`

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

  test('expenses page should show status filter', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Verify status filter is visible
    await expect(page.locator('button:has-text("All Status")')).toBeVisible({ timeout: 5000 })
  })

  test('status filter should have correct options', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter to open dropdown
    await page.click('button:has-text("All Status")')

    // Wait for dropdown to open
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })

    // Verify options exist
    await expect(page.locator('[data-slot="select-item"]:has-text("All Status")')).toBeVisible()
    await expect(page.locator('[data-slot="select-item"]:has-text("Pending Approval")')).toBeVisible()
    await expect(page.locator('[data-slot="select-item"]:has-text("Approved")')).toBeVisible()
  })

  test('should be able to filter by pending approval status', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')

    // Select Pending Approval
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Pending Approval")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=PENDING_APPROVAL/)
  })

  test('should be able to filter by approved status', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')

    // Select Approved
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Approved")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=APPROVED/)
  })

  test('add expense sheet should show approval notice', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click Add Expense button
    await page.click('button:has-text("Add Expense")')

    // Wait for sheet to open
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible({ timeout: 5000 })

    // Should see the approval notice info banner (the visible info text, not sr-only)
    await expect(page.locator('text=New expenses require approval')).toBeVisible({ timeout: 5000 })
  })

  test('status filter should maintain state when navigating', async ({ page }) => {
    // Navigate to expenses page with status filter in URL
    await page.goto('/expenses?status=PENDING_APPROVAL')

    // The status filter should show "Pending Approval" not "All Status"
    await expect(page.locator('button:has-text("Pending Approval")')).toBeVisible({ timeout: 5000 })
  })
})
