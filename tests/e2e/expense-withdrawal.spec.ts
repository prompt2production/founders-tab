import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Expense Withdrawal Flow', () => {
  let testUser = {
    name: 'Withdrawal Test User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `withdrawal-test-${Date.now()}@example.com`

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

  test('status filter should have withdrawal status options', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter to open dropdown
    await page.click('button:has-text("All Status")')

    // Wait for dropdown to open
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })

    // Verify withdrawal status options exist
    await expect(page.locator('[data-slot="select-item"]:has-text("Withdrawal Requested")')).toBeVisible()
    await expect(page.locator('[data-slot="select-item"]:has-text("Ready for Receipt")')).toBeVisible()
    await expect(page.locator('[data-slot="select-item"]:has-text("Received")')).toBeVisible()
  })

  test('should be able to filter by withdrawal requested status', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')

    // Select Withdrawal Requested
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Withdrawal Requested")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=WITHDRAWAL_REQUESTED/)
  })

  test('should be able to filter by ready for receipt status', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')

    // Select Ready for Receipt
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Ready for Receipt")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=WITHDRAWAL_APPROVED/)
  })

  test('should be able to filter by received status', async ({ page }) => {
    // Navigate to expenses page
    await page.goto('/expenses')

    // Click status filter dropdown
    await page.click('button:has-text("All Status")')

    // Select Received
    await page.waitForSelector('[data-slot="select-content"]', { timeout: 5000 })
    await page.click('[data-slot="select-item"]:has-text("Received")')

    // Verify URL updated with status param
    await expect(page).toHaveURL(/status=RECEIVED/)
  })

  test('status filter should maintain withdrawal state when navigating', async ({ page }) => {
    // Navigate to expenses page with status filter in URL
    await page.goto('/expenses?status=WITHDRAWAL_REQUESTED')

    // The status filter should show "Withdrawal Requested" not "All Status"
    await expect(page.locator('button:has-text("Withdrawal Requested")')).toBeVisible({ timeout: 5000 })
  })

  test('status filter should maintain ready for receipt state when navigating', async ({ page }) => {
    // Navigate to expenses page with status filter in URL
    await page.goto('/expenses?status=WITHDRAWAL_APPROVED')

    // The status filter should show "Ready for Receipt" not "All Status"
    await expect(page.locator('button:has-text("Ready for Receipt")')).toBeVisible({ timeout: 5000 })
  })

  test('status filter should maintain received state when navigating', async ({ page }) => {
    // Navigate to expenses page with status filter in URL
    await page.goto('/expenses?status=RECEIVED')

    // The status filter should show "Received" not "All Status"
    await expect(page.locator('button:has-text("Received")')).toBeVisible({ timeout: 5000 })
  })
})
