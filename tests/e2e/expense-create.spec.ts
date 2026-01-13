import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Create Expense Flow', () => {
  let testUser = {
    name: 'Expense Test User',
    email: '',
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create user once for all tests
    testUser.email = `expense-test-${Date.now()}@example.com`

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

  test('should open add expense sheet when clicking add expense button', async ({
    page,
  }) => {
    // Click Add Expense button in welcome card
    await page.click('button:has-text("Add Expense")')

    // Sheet should open with title
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible()
    await expect(page.locator('[data-slot="sheet-title"]')).toHaveText(
      'Add Expense'
    )

    // Form fields should be visible
    await expect(page.locator('text=Amount')).toBeVisible()
    await expect(page.locator('text=Description')).toBeVisible()
    await expect(page.locator('text=Category')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Click Add Expense button
    await page.click('button:has-text("Add Expense")')

    // Wait for sheet to open
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible()

    // Try to submit empty form
    await page.click(
      '[data-slot="sheet-content"] button[type="submit"]:has-text("Add Expense")'
    )

    // Should show validation errors
    await expect(
      page.locator('[data-slot="form-message"]').first()
    ).toBeVisible({
      timeout: 5000,
    })
  })

  test('should fill expense form fields', async ({ page }) => {
    // Click Add Expense button
    await page.click('button:has-text("Add Expense")')

    // Wait for sheet to open
    await expect(page.locator('[data-slot="sheet-title"]')).toBeVisible()

    // Fill in amount
    const amountInput = page.locator('input[inputmode="decimal"]')
    await amountInput.click()
    await amountInput.press('Control+a')
    await amountInput.type('45.50')

    // Verify amount is filled
    await expect(amountInput).toHaveValue('45.50')

    // Fill in description
    await page.fill(
      'input[placeholder="What was this expense for?"]',
      'Coffee meeting'
    )

    // Verify description is filled
    await expect(
      page.locator('input[placeholder="What was this expense for?"]')
    ).toHaveValue('Coffee meeting')

    // Click category button
    await page
      .locator('[data-slot="sheet-content"] button', { hasText: 'Food & Dining' })
      .click()

    // Date should be pre-filled
    await expect(page.locator('button:has-text("January")')).toBeVisible()
  })

  test('should show empty state when no expenses', async ({ page }) => {
    // The fresh user should see empty state
    await expect(page.locator('text=No expenses yet')).toBeVisible()
    await expect(
      page.locator('text=Start tracking by adding your first expense')
    ).toBeVisible()
  })
})
