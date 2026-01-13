import { test, expect } from '@playwright/test'

test.describe('Login and Logout Flow', () => {
  const testUser = {
    name: 'Login Test User',
    email: `login-test-${Date.now()}@example.com`,
    password: 'TestPassword123',
  }

  // Create user via signup before running login tests
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()

    // Create user via signup
    await page.goto('/signup')
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.click('button[type="submit"]')

    // Wait for signup to complete
    await page.waitForURL('/', { timeout: 10000 })

    // Logout so we can test login
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Logout' }).click()
    // Wait for dialog and click confirm
    await page.waitForSelector('[role="alertdialog"]')
    await page.getByRole('alertdialog').getByRole('button', { name: 'Logout' }).click()
    await page.waitForURL('/login', { timeout: 5000 })

    await page.close()
  })

  test('should login successfully and redirect to dashboard', async ({
    page,
  }) => {
    // Visit login page
    await page.goto('/login')

    // Verify login page loaded
    await expect(page.locator('text=Founders Tab')).toBeVisible()
    await expect(
      page.locator('text=Track expenses with your co-founders')
    ).toBeVisible()

    // Fill in login form
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 })

    // Verify user is logged in
    await expect(page.locator('text=Welcome back,')).toBeVisible()
    await expect(page.locator(`text=${testUser.name}`).first()).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should show error toast
    await expect(page.locator('text=Login failed')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    // Click logout button (opens confirmation dialog)
    await page.getByRole('button', { name: 'Logout' }).click()

    // Confirm logout in dialog
    await expect(page.locator('text=Are you sure?')).toBeVisible()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Logout' }).click()

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(
      page.locator('text=Track expenses with your co-founders')
    ).toBeVisible()
  })

  test('should have link to signup page', async ({ page }) => {
    await page.goto('/login')

    // Click sign up link
    await page.click('text=Sign up')

    // Should navigate to signup page
    await page.waitForURL('/signup')
    await expect(
      page.locator('text=Start tracking expenses with your co-founders')
    ).toBeVisible()
  })

  test('should redirect to login when accessing protected route while logged out', async ({
    page,
  }) => {
    // Try to access protected route
    await page.goto('/')

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(
      page.locator('text=Track expenses with your co-founders')
    ).toBeVisible()
  })
})
