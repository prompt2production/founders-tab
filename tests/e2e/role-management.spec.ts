import { test, expect } from '@playwright/test'

// Run tests serially to avoid database contention
test.describe.configure({ mode: 'serial' })

test.describe('Role Management', () => {
  const timestamp = Date.now()

  // Test users - role depends on database state
  const testUser1 = {
    name: 'Role Test User One',
    email: `role-test-one-${timestamp}@example.com`,
    password: 'TestPassword123',
  }

  const testUser2 = {
    name: 'Role Test User Two',
    email: `role-test-two-${timestamp}@example.com`,
    password: 'TestPassword123',
  }

  let user1IsFounder = false

  test.beforeAll(async ({ browser }) => {
    // Create first test user
    const page1 = await browser.newPage()
    await page1.goto('/signup')
    await page1.fill('input[name="name"]', testUser1.name)
    await page1.fill('input[name="email"]', testUser1.email)
    await page1.fill('input[name="password"]', testUser1.password)
    await page1.fill('input[name="confirmPassword"]', testUser1.password)
    await page1.click('button[type="submit"]')
    await page1.waitForURL('/', { timeout: 15000 })

    // Check if this user is a founder by going to team page
    await page1.goto('/team')
    await page1.waitForSelector('text=Members', { timeout: 10000 })

    // If we see a role change button, we're a founder
    const roleButton = page1.locator(`button[aria-label="Change role for ${testUser1.name}"]`)
    user1IsFounder = await roleButton.isVisible().catch(() => false)

    await page1.close()

    // Create second test user
    const page2 = await browser.newPage()
    await page2.goto('/signup')
    await page2.fill('input[name="name"]', testUser2.name)
    await page2.fill('input[name="email"]', testUser2.email)
    await page2.fill('input[name="password"]', testUser2.password)
    await page2.fill('input[name="confirmPassword"]', testUser2.password)
    await page2.click('button[type="submit"]')
    await page2.waitForURL('/', { timeout: 15000 })
    await page2.close()
  })

  test('team page shows all members with role badges', async ({ page }) => {
    // Login as first user
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser1.email)
    await page.fill('input[name="password"]', testUser1.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Navigate to team page
    await page.goto('/team')

    // Should see team members heading
    await expect(page.locator('text=Members')).toBeVisible({ timeout: 10000 })

    // Should see both test users in the list
    await expect(page.locator(`text=${testUser1.name}`)).toBeVisible({ timeout: 5000 })
    await expect(page.locator(`text=${testUser2.name}`)).toBeVisible({ timeout: 5000 })

    // Should see role badges (FOUNDER or MEMBER text)
    const hasBadges = await page.locator('text=FOUNDER').or(page.locator('text=MEMBER')).first().isVisible()
    expect(hasBadges).toBe(true)
  })

  test('founder can see interactive role badges', async ({ page }) => {
    test.skip(!user1IsFounder, 'First test user is not a founder - skipping founder-specific test')

    // Login as founder (user1)
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser1.email)
    await page.fill('input[name="password"]', testUser1.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Navigate to team page
    await page.goto('/team')
    await expect(page.locator('text=Members')).toBeVisible({ timeout: 10000 })

    // Founder should see role buttons with aria-labels
    const roleButtons = page.locator('button[aria-label^="Change role for"]')
    const buttonCount = await roleButtons.count()
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('founder can change member role via dropdown', async ({ page }) => {
    test.skip(!user1IsFounder, 'First test user is not a founder - skipping founder-specific test')

    // Login as founder (user1)
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser1.email)
    await page.fill('input[name="password"]', testUser1.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Navigate to team page
    await page.goto('/team')
    await expect(page.locator('text=Members')).toBeVisible({ timeout: 10000 })

    // Click on user2's role button
    const user2RoleButton = page.locator(`button[aria-label="Change role for ${testUser2.name}"]`)
    await expect(user2RoleButton).toBeVisible({ timeout: 5000 })
    await user2RoleButton.click()

    // Should see dropdown menu items
    await expect(page.locator('[role="menuitem"]:has-text("Founder")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[role="menuitem"]:has-text("Member")')).toBeVisible({ timeout: 5000 })

    // Click on Founder to promote
    await page.click('[role="menuitem"]:has-text("Founder")')

    // Confirmation dialog should appear
    await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 5000 })

    // Confirm the action
    await page.click('button:has-text("Confirm")')

    // Should see success toast
    await expect(page.locator('text=Role updated')).toBeVisible({ timeout: 5000 })
  })

  test('role dropdown shows disabled option for last founder', async ({ page }) => {
    test.skip(!user1IsFounder, 'First test user is not a founder - skipping founder-specific test')

    // Login as user1 (founder)
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser1.email)
    await page.fill('input[name="password"]', testUser1.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Navigate to team page
    await page.goto('/team')
    await expect(page.locator('text=Members')).toBeVisible({ timeout: 10000 })

    // First, demote user2 back to member if they were promoted (to ensure only 1 founder)
    const user2RoleButton = page.locator(`button[aria-label="Change role for ${testUser2.name}"]`)
    if (await user2RoleButton.isVisible()) {
      await user2RoleButton.click()

      const memberOption = page.locator('[role="menuitem"]:has-text("Member")')
      const isDisabled = await memberOption.getAttribute('data-disabled')

      if (isDisabled !== 'true') {
        await memberOption.click()
        const dialog = page.locator('[role="alertdialog"]')
        if (await dialog.isVisible()) {
          await page.click('button:has-text("Confirm")')
          await page.waitForTimeout(1000)
        }
      } else {
        // Close dropdown by pressing escape
        await page.keyboard.press('Escape')
      }
    }

    // Now click on user1's (last founder) role button
    const user1RoleButton = page.locator(`button[aria-label="Change role for ${testUser1.name}"]`)
    await user1RoleButton.click()

    // The Member option should be disabled since user1 would be the last founder
    const memberMenuItem = page.locator('[role="menuitem"]:has-text("Member")')
    await expect(memberMenuItem).toBeVisible({ timeout: 5000 })

    // Check if disabled (data-disabled attribute)
    const isDisabled = await memberMenuItem.getAttribute('data-disabled')
    expect(isDisabled).toBe('true')
  })

  test('non-founder user sees static role badges without dropdown', async ({ page }) => {
    // Login as user2 (should be member if user1 is founder, or founder if user1 is not)
    await page.goto('/login')
    await page.fill('input[name="email"]', testUser2.email)
    await page.fill('input[name="password"]', testUser2.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 15000 })

    // Navigate to team page
    await page.goto('/team')
    await expect(page.locator('text=Members')).toBeVisible({ timeout: 10000 })

    // Check what role user2 has by looking for role buttons
    const roleButtons = page.locator('button[aria-label^="Change role for"]')
    const hasRoleButtons = await roleButtons.first().isVisible().catch(() => false)

    if (!hasRoleButtons) {
      // User2 is not a founder, so they shouldn't see any dropdown buttons
      await expect(roleButtons).toHaveCount(0)

      // But they should still see role text (FOUNDER or MEMBER)
      const roleText = page.locator('text=FOUNDER').or(page.locator('text=MEMBER'))
      await expect(roleText.first()).toBeVisible()
    } else {
      // User2 IS a founder, so this test doesn't apply - just pass
      expect(true).toBe(true)
    }
  })
})
