# Dev Quick Login

## Overview

A development-only feature that provides quick login buttons on the login page for predefined test user accounts. This allows developers to quickly switch between different user accounts during local development without having to manually type credentials each time.

## User Stories

### As a developer
- I want to quickly log in as different test users during development
- I want this feature to only appear in development mode (not in production)
- I want a simple click-to-login experience

## Detailed Requirements

### Environment Detection

The feature must ONLY appear when:
- Running in development mode (`NODE_ENV === 'development'`)
- Running on localhost

This ensures the feature never appears in production builds.

### Predefined Users

The following test accounts are available for quick login:

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

### Environment Check

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

- This feature MUST NOT appear in production
- The predefined passwords should match what's in the dev/test database
- Consider using environment variables for the credentials (optional)
