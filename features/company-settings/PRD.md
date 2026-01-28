# Company Settings

## Overview

Allow founders to configure basic company information that applies to the entire team. This introduces a shared `CompanySettings` model (singleton per deployment) storing the company name and default currency. Any user with the `FOUNDER` role can view and modify these settings. Members can view but not edit.

## User Stories

1. As a founder, I want to set my company's name so that expenses are associated with a recognisable entity.
2. As a founder, I want to choose a default currency so that all monetary values are displayed consistently.
3. As a member, I can see the company name and currency but cannot change them.

## Detailed Requirements

### Database

Add a `CompanySettings` model to the Prisma schema:

| Field      | Type     | Default      | Notes                        |
|------------|----------|--------------|------------------------------|
| id         | String   | cuid()       | Primary key                  |
| name       | String   | ""           | Company display name         |
| currency   | String   | "USD"        | ISO 4217 currency code       |
| createdAt  | DateTime | now()        |                              |
| updatedAt  | DateTime | @updatedAt   |                              |

The app operates as a single-tenant deployment, so there will be exactly one row in this table. The first `GET` request should auto-create the row if it doesn't exist (upsert pattern).

### Supported Currencies

For the MVP, support a curated list of common currencies:

| Code | Symbol | Label              |
|------|--------|--------------------|
| USD  | $      | US Dollar          |
| GBP  | £      | British Pound      |
| EUR  | €      | Euro               |
| CAD  | C$     | Canadian Dollar    |
| AUD  | A$     | Australian Dollar  |
| NZD  | NZ$    | New Zealand Dollar |
| JPY  | ¥      | Japanese Yen       |
| CHF  | CHF    | Swiss Franc        |
| SEK  | kr     | Swedish Krona      |
| NOK  | kr     | Norwegian Krone    |
| INR  | ₹      | Indian Rupee       |
| ZAR  | R      | South African Rand |

### API Endpoints

#### `GET /api/company-settings`

- **Auth:** Any authenticated user
- **Response:** `{ id, name, currency, createdAt, updatedAt }`
- **Behaviour:** If no row exists, create one with defaults and return it (upsert).

#### `PATCH /api/company-settings`

- **Auth:** `FOUNDER` role only
- **Body:** `{ name?: string, currency?: string }`
- **Validation:**
  - `name`: string, max 100 characters, trimmed
  - `currency`: must be one of the supported currency codes
- **Response:** Updated settings object
- **Errors:** 401 Unauthorized, 403 Forbidden, 400 Validation error

### UI / UX

#### Settings Page (`/settings`)

- Add a new route `/settings` accessible from the app navigation.
- **Page layout** follows `DESIGN_SYSTEM.md` patterns:
  - Page title: "Company Settings"
  - Card containing the settings form
- **Form fields:**
  - **Company Name** — text input, placeholder "Enter company name"
  - **Currency** — select dropdown with the supported currencies list, default USD
- **Save button** — full-width on mobile, auto-width on desktop
- **Behaviour:**
  - On load, fetch `GET /api/company-settings` and populate form
  - On save, call `PATCH /api/company-settings`
  - Show success toast on save
  - Show error toast on failure
  - Members see the form fields as read-only (disabled) with a note explaining only founders can edit
- **Loading state:** Skeleton placeholders while fetching settings

#### Navigation

- Add "Settings" link to the desktop sidebar/header navigation (gear icon)
- Add "Settings" to the mobile bottom navigation
- Position after "Team" in the nav order

### Validation Schema

Create `src/lib/validations/company-settings.ts`:

```typescript
import { z } from 'zod'

export const SUPPORTED_CURRENCIES = [
  'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'NZD',
  'JPY', 'CHF', 'SEK', 'NOK', 'INR', 'ZAR',
] as const

export const updateCompanySettingsSchema = z.object({
  name: z.string().max(100).trim().optional(),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
})
```

## Out of Scope

- Multi-tenancy / multiple companies
- Company logo or branding
- Custom expense categories
- Approval thresholds or policies
- Displaying currency symbols throughout the app (future enhancement)
