# Expense Submission Feature

## Overview

Enable users to log business expenses with essential details including date, amount, description, and category. Users can optionally attach receipt images for documentation. This is the core feature of Founders Tab, allowing co-founders to track and share expense information.

## User Stories (Plain English)

1. As a user, I want to add a new expense so I can track my business spending
2. As a user, I want to categorize my expenses so I can understand where money is going
3. As a user, I want to attach a receipt photo so I have documentation for accounting
4. As a user, I want to see my recent expenses on the dashboard so I can review my spending
5. As a user, I want to edit an expense if I made a mistake
6. As a user, I want to delete an expense if it was entered incorrectly

## Detailed Requirements

### Expense Data Model

Each expense must capture:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| userId | UUID | Yes | Reference to user who created it |
| date | Date | Yes | Date of the expense (defaults to today) |
| amount | Decimal | Yes | Amount in dollars (2 decimal places) |
| description | String | Yes | Brief description (1-200 chars) |
| category | Enum | Yes | Predefined category |
| receiptUrl | String | No | URL to uploaded receipt image |
| notes | String | No | Additional notes (0-500 chars) |
| createdAt | DateTime | Yes | When record was created |
| updatedAt | DateTime | Yes | When record was last updated |

### Categories

Predefined expense categories (stored as enum for simplicity):

| Category | Icon | Description |
|----------|------|-------------|
| FOOD | Utensils | Meals, coffee, snacks |
| TRANSPORT | Car | Uber, taxi, parking, fuel |
| SOFTWARE | Monitor | SaaS subscriptions, tools |
| HARDWARE | Laptop | Equipment, devices |
| OFFICE | Building | Office supplies, furniture |
| TRAVEL | Plane | Flights, hotels, conferences |
| MARKETING | Megaphone | Ads, promotions, events |
| SERVICES | Briefcase | Contractors, consultants |
| OTHER | MoreHorizontal | Miscellaneous |

### Validation Rules

**Amount:**
- Required
- Must be positive number
- Maximum 2 decimal places
- Maximum value: $999,999.99
- Minimum value: $0.01

**Description:**
- Required
- 1-200 characters
- Trimmed of whitespace

**Date:**
- Required
- Cannot be in the future (max = today)
- Cannot be more than 1 year in the past

**Category:**
- Required
- Must be valid category enum value

**Receipt:**
- Optional
- Accepted formats: JPEG, PNG, WebP, PDF
- Maximum file size: 5MB

### API Endpoints

#### POST /api/expenses
Create a new expense.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "amount": 45.99,
  "description": "Team lunch at restaurant",
  "category": "FOOD",
  "receiptUrl": "https://...",
  "notes": "Client meeting lunch"
}
```

**Response:** 201 Created with expense object

#### GET /api/expenses
List expenses for current user.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` (optional filter)
- `startDate` (optional filter)
- `endDate` (optional filter)

**Response:** 200 OK with paginated expense array

#### GET /api/expenses/[id]
Get single expense by ID.

**Response:** 200 OK with expense object, or 404 if not found

#### PATCH /api/expenses/[id]
Update an expense. User can only update their own expenses.

**Request Body:** Partial expense object (only fields to update)

**Response:** 200 OK with updated expense object

#### DELETE /api/expenses/[id]
Delete an expense. User can only delete their own expenses.

**Response:** 200 OK on success

#### POST /api/upload
Upload a receipt image.

**Request:** multipart/form-data with file

**Response:** 200 OK with `{ url: "https://..." }`

### UI/UX Requirements

#### Add Expense Flow

1. User taps "Add Expense" button (prominent on home page)
2. Bottom sheet slides up (mobile) or modal appears (desktop)
3. Form displays with:
   - Amount input (large, prominent, with $ prefix)
   - Description input
   - Category selector (grid of icons or dropdown)
   - Date picker (defaults to today)
   - Receipt upload area (optional)
   - Notes textarea (optional, collapsed by default)
4. User fills form and taps "Add Expense"
5. Success toast appears, sheet closes
6. Expense appears in list

#### Home Page Updates

- Replace placeholder stats with real expense totals
- Show "Recent Expenses" list (last 5-10 expenses)
- Each expense item shows: category icon, description, amount, date
- "View All" link to full expenses page (future feature)

#### Expense List Item (per DESIGN_SYSTEM.md)

```
[Icon] Description                    -$XX.XX
       Date                           Category
```

#### Form Layout (per DESIGN_SYSTEM.md)

- Use Sheet component on mobile
- Large amount input with $ prefix
- Category as icon grid (2 rows of icons)
- Standard form inputs for other fields
- Full-width submit button on mobile, auto-width on desktop

### Receipt Upload

**Implementation approach:** Store files locally in `/public/uploads/receipts/` for MVP. In production, would use cloud storage (S3, Cloudinary, etc.).

**Upload flow:**
1. User clicks upload area or drags file
2. File is validated (type, size)
3. File is uploaded to server
4. Server returns URL
5. URL is stored with expense

### Error Handling

- Show inline validation errors on form fields
- Show toast for API errors
- Handle network failures gracefully
- Optimistic UI updates with rollback on failure

### Mobile Considerations

- Large touch targets for category selection
- Native date picker on mobile
- Camera access for receipt photos (future enhancement)
- Bottom sheet for forms (not modal)

## Technical Notes

### Database

Add to Prisma schema:
- `Category` enum
- `Expense` model with relations to User

### File Storage

For MVP, use local file storage:
- Store in `/public/uploads/receipts/`
- Generate unique filenames with timestamps
- Serve statically via Next.js

### State Management

- Use React Query or SWR for expense list caching
- Optimistic updates for better UX
- Invalidate cache on mutations

## Out of Scope (Future Features)

- Bulk expense import (CSV)
- Recurring expenses
- Expense approval workflow
- Export to accounting software
- Multi-currency support
- Expense splitting between users
- Full expenses page with search/filter UI
- Receipt OCR (auto-fill from photo)

## Definition of Done

- [ ] User can create expense with all required fields
- [ ] User can attach receipt image
- [ ] Expenses appear on home dashboard
- [ ] User can edit their own expenses
- [ ] User can delete their own expenses
- [ ] All forms follow DESIGN_SYSTEM.md patterns
- [ ] Unit tests for validation schemas
- [ ] E2E test for expense creation flow
- [ ] Works on mobile viewport (375px+)
