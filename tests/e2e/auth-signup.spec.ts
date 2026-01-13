import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123',
  }

  test('should complete signup flow and redirect to dashboard', async ({
    page,
  }) => {
    // Visit signup page
    await page.goto('/signup')

    // Verify signup page loaded
    await expect(page.locator('text=Founders Tab')).toBeVisible()
    await expect(page.locator('text=Start tracking expenses')).toBeVisible()

    // Fill in the signup form
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)

    // Verify password strength indicators are visible (all checks should pass)
    await expect(page.locator('text=At least 8 characters')).toBeVisible()
    await expect(page.locator('text=One uppercase letter')).toBeVisible()
    await expect(page.locator('text=One lowercase letter')).toBeVisible()
    await expect(page.locator('text=One number')).toBeVisible()

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard (home page)
    await page.waitForURL('/', { timeout: 10000 })

    // Verify user is logged in - should see welcome message with user name
    await expect(page.locator(`text=Welcome back,`)).toBeVisible({
      timeout: 5000,
    })
    await expect(page.locator(`text=${testUser.name}`).first()).toBeVisible()

    // Verify dashboard content is visible
    await expect(page.locator('text=Your Expenses')).toBeVisible()
    await expect(page.locator('text=Getting Started')).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/signup')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(
      page.locator('text=Name must be at least 2 characters')
    ).toBeVisible()
    await expect(
      page.locator('text=Please enter a valid email address')
    ).toBeVisible()
  })

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/signup')

    // Fill form with mismatched passwords
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123')
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should have link to login page', async ({ page }) => {
    await page.goto('/signup')

    // Click sign in link
    await page.click('text=Sign in')

    // Should navigate to login page
    await page.waitForURL('/login')
    await expect(page.locator('text=Track expenses with your co-founders')).toBeVisible()
  })
})
