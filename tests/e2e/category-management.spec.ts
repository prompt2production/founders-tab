import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test.describe('Category Management', () => {
  const timestamp = Date.now()

  const testUser = {
    name: 'Category Test User',
    email: `category-test-${timestamp}@example.com`,
    password: 'TestPassword123',
  }

  test.beforeAll(async ({ browser }) => {
    // Create test user via signup (will be a founder of a new company)
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

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })
  }

  test('founder can view categories in settings', async ({ page }) => {
    await login(page)
    await page.goto('/settings')

    // Check the categories section is visible
    await expect(page.locator('text=Expense Categories')).toBeVisible({ timeout: 10000 })

    // Default categories should be visible
    await expect(page.locator('text=Food & Dining')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Transport')).toBeVisible()
    await expect(page.locator('text=Software')).toBeVisible()
    await expect(page.locator('text=Other')).toBeVisible()
  })

  test('founder can add a new category', async ({ page }) => {
    await login(page)
    await page.goto('/settings')

    // Wait for categories section to load
    await expect(page.locator('text=Expense Categories')).toBeVisible({ timeout: 10000 })

    // Click Add Category button
    await page.click('button:has-text("Add Category")')

    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })

    // Fill in the category details
    await page.fill('input[id="label"], input[name="label"]', 'Legal Fees')

    // Submit the form
    await page.click('button:has-text("Create Category")')

    // Wait for success toast
    await expect(page.locator('text=Category created')).toBeVisible({ timeout: 5000 })

    // New category should appear in the list
    await expect(page.locator('text=Legal Fees')).toBeVisible({ timeout: 5000 })
  })

  test('founder can disable a category', async ({ page }) => {
    await login(page)
    await page.goto('/settings')

    // Wait for categories section to load
    await expect(page.locator('text=Expense Categories')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Food & Dining')).toBeVisible({ timeout: 5000 })

    // Find the first switch in the category list and toggle it
    const firstSwitch = page.locator('button[role="switch"]').first()
    await firstSwitch.click()

    // Wait for success toast
    await expect(page.locator('text=Category disabled')).toBeVisible({ timeout: 5000 })
  })

  test('categories appear in expense form', async ({ page }) => {
    await login(page)
    await page.goto('/expenses')

    // Click add expense
    await page.click('button:has-text("Add Expense")')

    // Wait for category picker to load
    await page.waitForTimeout(1000)

    // Category picker should show categories (look for button with text)
    await expect(page.locator('button:has-text("Transport")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Software")')).toBeVisible()
  })

  test('selecting Other category shows input field', async ({ page }) => {
    await login(page)
    await page.goto('/expenses')

    // Click add expense
    await page.click('button:has-text("Add Expense")')

    // Wait for form to load
    await page.waitForTimeout(1000)

    // Select Other category
    await page.click('button:has-text("Other")')

    // Custom category input should appear
    await expect(page.locator('input[placeholder*="custom category"]')).toBeVisible({ timeout: 5000 })
  })

  test('category filter shows dynamic categories', async ({ page }) => {
    await login(page)
    await page.goto('/expenses')

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Open category filter dropdown (first select trigger)
    const selectTrigger = page.locator('[data-slot="select-trigger"]').first()
    await selectTrigger.click()

    // Default categories should appear in filter
    await expect(page.locator('[role="option"]:has-text("All Categories")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[role="option"]:has-text("Transport")')).toBeVisible()
  })
})

// Note: Member role tests would require creating a member user which is complex
// The CategoryList component handles isReadOnly prop which hides the Add button
