import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display marketing content for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/')

    // Verify main heading with branding
    await expect(page.locator('h1:has-text("Founders Tab")')).toBeVisible()

    // Verify tagline
    await expect(
      page.locator('text=Keep tabs on shared business spending')
    ).toBeVisible()

    // Verify value proposition bullet points
    await expect(
      page.locator('text=Track who spent what for the business')
    ).toBeVisible()
    await expect(
      page.locator('text=Maintain clear records for future reimbursement')
    ).toBeVisible()
    await expect(
      page.locator('text=Transparency across all co-founders')
    ).toBeVisible()

    // Verify supporting text
    await expect(
      page.locator('text=Simple tracking until proper accounting takes over')
    ).toBeVisible()
  })

  test('should have Get Started button that navigates to signup', async ({
    page,
  }) => {
    await page.goto('/')

    // Verify Get Started button is visible
    const getStartedButton = page.getByRole('link', { name: 'Get Started' })
    await expect(getStartedButton).toBeVisible()

    // Click and verify navigation
    await getStartedButton.click()
    await page.waitForURL('/signup', { timeout: 5000 })
    await expect(page.url()).toContain('/signup')
  })

  test('should have Log In button that navigates to login', async ({
    page,
  }) => {
    await page.goto('/')

    // Verify Log In button is visible
    const loginButton = page.getByRole('link', { name: 'Log In' })
    await expect(loginButton).toBeVisible()

    // Click and verify navigation
    await loginButton.click()
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page.url()).toContain('/login')
  })

  test('should redirect authenticated users to expenses page', async ({
    page,
  }) => {
    const testUser = {
      name: 'Home Page Test User',
      email: `homepage-test-${Date.now()}@example.com`,
      password: 'TestPassword123',
    }

    // Create user via signup
    await page.goto('/signup')
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.click('button[type="submit"]')

    // Wait for signup to complete and redirect
    await page.waitForURL(/\/(expenses)?$/, { timeout: 10000 })

    // Now visit home page - should redirect to /expenses
    await page.goto('/')

    // Should be redirected away from home page to authenticated area
    await page.waitForURL('/expenses', { timeout: 10000 })
    await expect(page.url()).toContain('/expenses')
  })
})
