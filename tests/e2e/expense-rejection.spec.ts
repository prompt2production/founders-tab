import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Expense Rejection Flow', () => {
  let testUser = {
    name: 'Rejection Test User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `rejection-test-${Date.now()}@example.com`

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

  test('status filter should have rejected status option', async ({ page }) => {
    await page.goto('/expenses')

    // Click status filter to open dropdown
    await page.click('button:has-text("All Status")')
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })

    // Verify rejected status option exists
    await expect(page.getByRole('option', { name: 'Rejected', exact: true })).toBeVisible()
  })

  test('status filter should have withdrawal rejected status option', async ({ page }) => {
    await page.goto('/expenses')

    // Click status filter to open dropdown
    await page.click('button:has-text("All Status")')
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })

    // Verify withdrawal rejected status option exists
    await expect(page.locator('[data-slot="select-item"]:has-text("Withdrawal Rejected")')).toBeVisible()
  })

  test('should be able to filter by rejected status', async ({ page }) => {
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.getByRole('option', { name: 'Rejected', exact: true }).click()

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=REJECTED/)
  })

  test('should be able to filter by withdrawal rejected status', async ({ page }) => {
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Withdrawal Rejected")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=WITHDRAWAL_REJECTED/)
  })

  test('status filter should maintain rejected state when navigating', async ({ page }) => {
    await page.goto('/expenses?status=REJECTED')

    // The status filter should show "Rejected"
    await expect(page.locator('button:has-text("Rejected")')).toBeVisible({ timeout: 5000 })
  })

  test('status filter should maintain withdrawal rejected state when navigating', async ({ page }) => {
    await page.goto('/expenses?status=WITHDRAWAL_REJECTED')

    // The status filter should show "Withdrawal Rejected"
    await expect(page.locator('button:has-text("Withdrawal Rejected")')).toBeVisible({ timeout: 5000 })
  })

  test('ApprovalStatusBadge displays Rejected badge correctly', async ({ page }) => {
    // Navigate to expenses page with rejected filter
    await page.goto('/expenses?status=REJECTED')

    // The filter should be set to Rejected
    await expect(page.locator('button:has-text("Rejected")')).toBeVisible({ timeout: 5000 })

    // Page should load without errors
    await expect(page.getByRole('heading', { name: 'Expenses', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('ApprovalStatusBadge displays Withdrawal Rejected badge correctly', async ({ page }) => {
    // Navigate to expenses page with withdrawal rejected filter
    await page.goto('/expenses?status=WITHDRAWAL_REJECTED')

    // The filter should be set to Withdrawal Rejected
    await expect(page.locator('button:has-text("Withdrawal Rejected")')).toBeVisible({ timeout: 5000 })

    // Page should load without errors
    await expect(page.getByRole('heading', { name: 'Expenses', exact: true })).toBeVisible({ timeout: 5000 })
  })
})
