# Home Page - Product Requirements Document

## Overview

A minimalistic marketing home page that serves as the default landing page for Founders Tab. The page introduces visitors to the product, explains its value proposition, and provides quick access to login/register functionality.

## User Stories

### As a first-time visitor
- I want to immediately understand what Founders Tab is
- I want to see how it solves my problem of tracking shared expenses
- I want to quickly sign up or log in without scrolling

### As a returning user
- I want to quickly access the login page
- I want to be reminded of the app's purpose if I forgot

## Design Philosophy

**Extremely minimalistic** - This is not a feature-heavy marketing site. It's a single-screen landing that communicates:
1. What the product is (one line)
2. What problem it solves (2-3 bullet points max)
3. Why it matters (one supporting statement)
4. Clear CTA buttons

The design should follow the established dark mode aesthetic with orange/red gradient accents, but use negative space generously.

## Requirements

### Layout Structure

```
┌─────────────────────────────────────────┐
│                                         │
│           [Logo/Brand Name]             │
│                                         │
│         One-line value prop             │
│                                         │
│     • Benefit 1                         │
│     • Benefit 2                         │
│     • Benefit 3                         │
│                                         │
│     [Get Started]    [Login]            │
│                                         │
│         "For co-founders..."            │
│                                         │
└─────────────────────────────────────────┘
```

### Content Requirements

**Hero Section:**
- App name "Founders Tab" with gradient styling (matching existing brand)
- Tagline: Something like "Track expenses before incorporation"
- Keep it to one line, no sub-headline needed

**Value Proposition (3 bullet points max):**
1. Track who spent what for the business
2. Maintain clear records for future reimbursement
3. Transparency across all co-founders

**Call-to-Action:**
- Primary: "Get Started" → links to `/signup`
- Secondary: "Log In" → links to `/login`
- Buttons should be prominent but not overwhelming

**Supporting Text:**
- One brief line reinforcing the target audience
- Example: "Built for small founding teams who aren't incorporated yet"

### Technical Requirements

**File Location:** `src/app/page.tsx`

**Routing Behaviour:**
- Authenticated users who visit `/` should be redirected to `/expenses` (or the main dashboard)
- Unauthenticated users see the marketing page

**Responsive Design:**
- Mobile-first design
- Content centered on all viewports
- Buttons stack vertically on mobile, side-by-side on desktop

**Performance:**
- No client-side JavaScript required for the marketing content
- Server component where possible
- Auth check can be client-side for redirect

### UI/UX Requirements (per DESIGN_SYSTEM.md)

- Background: `bg-background` (#0D0D0F)
- Logo text: Use gradient styling `bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent`
- Typography: `text-4xl font-bold` for logo, `text-lg text-muted-foreground` for tagline
- Bullet points: Use subtle icons or simple dots, `text-sm text-muted-foreground`
- Primary button: Default button variant with orange background
- Secondary button: `variant="outline"` or `variant="secondary"`
- Spacing: Generous use of vertical spacing, center everything
- Animation: Minimal, perhaps a subtle fade-in on load

### Accessibility

- All interactive elements keyboard accessible
- Proper heading hierarchy (h1 for brand, no other headings needed)
- Good colour contrast (WCAG AA)
- Skip link not needed for such a simple page

## Out of Scope

- Navigation header/menu
- Footer with links
- Feature comparison tables
- Testimonials or social proof
- Pricing information
- Animated illustrations
- Newsletter signup
- Multiple sections requiring scroll

## Database Changes

None required.

## API Endpoints

None required.

## Testing Requirements

**Unit Tests:**
- None needed for static content

**E2E Tests:**
- Verify page loads correctly
- Verify "Get Started" button navigates to signup
- Verify "Log In" button navigates to login
- Verify authenticated users are redirected to app

## Success Criteria

1. First-time visitors understand what the product does within 5 seconds
2. CTAs are immediately visible without scrolling on mobile
3. Page loads in under 1 second
4. Authenticated users never see the marketing page (auto-redirect)
