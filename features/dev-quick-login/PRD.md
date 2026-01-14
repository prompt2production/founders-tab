# Dev Quick Login

## Overview

This feature has two parts:

1. **Database Console Refactoring** - Refactor the db-console seed functionality to separate user seeding from expense data seeding, providing more granular control over test data creation
2. **Quick Login UI** - A development-only component that provides quick login buttons on the login page for predefined test user accounts

## Part 1: Database Console Seed Refactoring

### Current State

The existing `seed-data.ts` command:
- Seeds 3 test users (Alice, Bob, Carol) with example.com emails
- Seeds 13 expenses with various statuses
- Seeds approvals and withdrawal approvals
- All done in a single command

### Proposed Changes

Replace the single "Seed test data" option with two separate options:
1. **Seed users** - Creates the three founder accounts
2. **Seed expense data** - Creates expenses for all existing users

### New Menu Structure

```
Database Console
================
Environment: Development
1. Clear all data
2. Seed users
3. Seed expense data
4. Exit
```

### Seed Users Command

Creates three founder accounts:

| Name | Email | Password |
|------|-------|----------|
| Chris | chris@founderstab.com | Password123! |
| Candice | candice@founderstab.com | Password123! |
| Adrian | adrian@founderstab.com | Password123! |

**Behaviour:**
- Checks if users already exist (by email) and skips if present
- Uses bcrypt to hash passwords (same hash as existing)
- Creates users with initials: C, C, A
- Shows summary of users created/skipped

### Seed Expense Data Command

Creates realistic expense data for **all users currently in the database**.

**Dependency:**
- Requires at least 2 users to exist in the database
- Shows error message if insufficient users exist

**Behaviour:**
- Queries all existing users from database
- Creates expenses distributed across all users
- Creates approval records based on existing users
- Creates withdrawal approval records where applicable
- Maintains realistic distribution of expense statuses

---

## Part 2: Quick Login UI Component

### User Stories

**As a developer:**
- I want to quickly log in as different test users during development
- I want this feature to only appear in development mode (not in production)
- I want a simple click-to-login experience

### Environment Detection

The feature must ONLY appear when:
- Running in development mode (`NODE_ENV === 'development'`)
- Running on localhost

This ensures the feature never appears in production builds.

### Predefined Users

The same accounts from Part 1:

| Name | Email | Password |
|------|-------|----------|
| Chris | chris@founderstab.com | Password123! |
| Candice | candice@founderstab.com | Password123! |
| Adrian | adrian@founderstab.com | Password123! |

### UI/UX Requirements

- Display below the main login form
- Use a subtle, developer-focused design (not prominent)
- Show a dropdown or button group to select users
- Show loading state during login
- On successful login, redirect same as normal login
- On error (e.g., user doesn't exist), show toast notification

### Component Location

```
src/components/auth/dev-quick-login.tsx
```

### Visual Design

- Use a muted/subtle appearance to indicate it's a dev tool
- Consider a collapsible section or simple dropdown
- Include a visual indicator that this is dev-only (e.g., "Dev Quick Login" label)
- Follow existing design system colors

## Technical Requirements

### Environment Check (UI Component)

```typescript
// Only render in development
if (process.env.NODE_ENV !== 'development') {
  return null
}
```

### Integration

- Use existing `useAuth` hook for login functionality
- Reuse the same login flow as the main form
- Handle errors gracefully with toast notifications

## Security Considerations

- Quick login UI MUST NOT appear in production
- The predefined passwords should match what's in the dev/test database
- Both db-console commands blocked on production environment
