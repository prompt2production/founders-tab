import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test.describe('Company Settings', () => {
  const timestamp = Date.now()

  const testUser = {
    name: 'Settings Test User',
    email: `settings-test-${timestamp}@example.com`,
    password: 'TestPassword123',
  }

  let userIsFounder = false

  test.beforeAll(async ({ browser }) => {
    // Create test user via signup
    const page = await browser.newPage()
    await page.goto('/signup')
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Check role by navigating to settings and looking for the Save button
    await page.goto('/settings')
    await page.waitForSelector('h1:has-text("Company Settings")', { timeout: 10000 })

    // If save button visible, user is founder
    const saveButton = page.locator('button:has-text("Save Changes")')
    userIsFounder = await saveButton.isVisible({ timeout: 5000 }).catch(() => false)

    await page.close()
  })

  test('user can navigate to /settings and see the form', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    await page.goto('/settings')

    // Should see the page title
    await expect(page.locator('h1:has-text("Company Settings")')).toBeVisible({ timeout: 10000 })

    // Should see the Company Name input
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 5000 })
  })

  test('founder can update company name and currency and see success toast', async ({ page }) => {
    test.skip(!userIsFounder, 'Test user is not a founder - skipping founder-specific test')

    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    await page.goto('/settings')
    await expect(page.locator('h1:has-text("Company Settings")')).toBeVisible({ timeout: 10000 })

    // Wait for form to load
    const nameInput = page.locator('input[name="name"]')
    await nameInput.waitFor({ state: 'visible', timeout: 5000 })

    // Fill in company name
    await nameInput.clear()
    await nameInput.fill('E2E Test Company')

    // Change currency via select
    const selectTrigger = page.locator('[data-slot="select-trigger"]')
    await selectTrigger.click()
    await page.locator('[role="option"]:has-text("GBP")').click()

    // Submit
    await page.click('button:has-text("Save Changes")')

    // Should see success toast
    await expect(page.locator('text=Company settings updated')).toBeVisible({ timeout: 5000 })
  })

  test('after save, refreshing the page shows the updated values', async ({ page }) => {
    test.skip(!userIsFounder, 'Test user is not a founder - skipping founder-specific test')

    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    await page.goto('/settings')
    await expect(page.locator('h1:has-text("Company Settings")')).toBeVisible({ timeout: 10000 })

    // Wait for the form to load with values
    const nameInput = page.locator('input[name="name"]')
    await nameInput.waitFor({ state: 'visible', timeout: 5000 })

    // The previously saved company name should be shown
    await expect(nameInput).toHaveValue('E2E Test Company', { timeout: 5000 })

    // The currency select should show GBP
    await expect(page.locator('[data-slot="select-trigger"]')).toContainText('GBP', { timeout: 5000 })
  })

  test('member sees read-only form fields on /settings', async ({ page }) => {
    test.skip(userIsFounder, 'Test user is a founder - skipping member-specific test')

    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    await page.goto('/settings')
    await expect(page.locator('h1:has-text("Company Settings")')).toBeVisible({ timeout: 10000 })

    // Should see the read-only info message
    await expect(page.locator('text=Only founders can edit company settings')).toBeVisible({ timeout: 5000 })

    // The name input should be disabled
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toBeDisabled({ timeout: 5000 })

    // The save button should not be visible
    await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible()
  })
})
