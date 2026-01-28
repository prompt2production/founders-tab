# Email Notifications & Rejection Workflow

## Overview

Implement email notifications for key expense lifecycle events and add the missing rejection workflow for both expenses and withdrawal requests. Currently the system only supports approval flows — rejection needs to be built as a prerequisite for rejected-state notifications.

## Notification Types

| # | Event | Recipients | Trigger |
|---|-------|-----------|---------|
| 1 | **New expense awaiting approval** | All founders except submitter | Expense created with `PENDING_APPROVAL` status |
| 2 | **Expense approved** | Expense submitter | All required founders have approved (status → `APPROVED`) |
| 3 | **Expense rejected** | Expense submitter | Any founder rejects the expense (status → `REJECTED`) |
| 4 | **Withdrawal approved** | Expense owner | All required founders approve withdrawal (status → `WITHDRAWAL_APPROVED`) |
| 5 | **Withdrawal rejected** | Expense owner | Any founder rejects the withdrawal (status → `WITHDRAWAL_REJECTED`) |

## Rejection Workflow (New)

### Rules
- **Any single founder can reject** — unlike approval which requires all founders
- **Rejection is immediate and final** — no further approvals are processed
- **Reason is required** — rejector must provide a text reason (1-500 characters)
- **Cannot reject own expense** — same rule as approval
- **Only founders can reject** — same role restriction as approval

### Status Transitions
```
PENDING_APPROVAL → REJECTED           (any founder rejects expense)
WITHDRAWAL_REQUESTED → WITHDRAWAL_REJECTED  (any founder rejects withdrawal)
```

### What Happens After Rejection
- Rejected expenses remain visible in the expense list with a rejected status badge
- The expense owner can delete the rejected expense and re-submit if desired
- No automatic re-submission flow

## Database Changes

### ExpenseStatus Enum
Add two new values:
```prisma
enum ExpenseStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED              // NEW
  WITHDRAWAL_REQUESTED
  WITHDRAWAL_APPROVED
  WITHDRAWAL_REJECTED   // NEW
  RECEIVED
}
```

### Expense Model
Add rejection tracking fields:
```prisma
model Expense {
  // ... existing fields ...
  rejectedById    String?
  rejectedAt      DateTime?
  rejectionReason String?
  rejectedBy      User?    @relation("RejectedExpenses", fields: [rejectedById], references: [id])
}
```

### User Model
Add reverse relation:
```prisma
model User {
  // ... existing fields ...
  rejectedExpenses Expense[] @relation("RejectedExpenses")
}
```

## API Endpoints

### POST /api/expenses/[id]/reject
Reject a pending expense.

**Request body:**
```json
{ "reason": "This doesn't look like a business expense" }
```

**Validation:**
- User must be authenticated
- User must have FOUNDER role
- User must not be the expense creator
- Expense must be in `PENDING_APPROVAL` status
- Reason is required (1-500 characters)

**Response:** Updated expense with rejection details

### POST /api/expenses/[id]/reject-withdrawal
Reject a pending withdrawal request.

**Request body:**
```json
{ "reason": "Need more documentation before approving withdrawal" }
```

**Validation:**
- User must be authenticated
- User must have FOUNDER role
- User must not be the expense owner
- Expense must be in `WITHDRAWAL_REQUESTED` status
- Reason is required (1-500 characters)

**Response:** Updated expense with rejection details

## Email Template Design

All notification emails follow the existing brand template established in `src/lib/email.ts`:
- Dark theme (#1a1a1a background)
- Orange-to-red gradient header with "Founders Tab" title
- Expense details card showing: description, amount, category, date, submitter
- Action-specific messaging and CTA button linking to the expense
- Plain text fallback for all emails

### Email Content Per Type

**1. New Expense Awaiting Approval**
- Subject: `"New expense from {submitterName} needs your approval"`
- Body: Expense details + "Review Expense" button → `/expenses` page
- Tone: Informational

**2. Expense Approved**
- Subject: `"Your expense has been approved"`
- Body: Expense details + approval confirmation + "View Expense" button
- Tone: Positive

**3. Expense Rejected**
- Subject: `"Your expense has been rejected"`
- Body: Expense details + rejection reason + who rejected + "View Expense" button
- Tone: Neutral/informative

**4. Withdrawal Approved**
- Subject: `"Your withdrawal request has been approved"`
- Body: Expense details + withdrawal confirmation + "Confirm Receipt" button
- Tone: Positive

**5. Withdrawal Rejected**
- Subject: `"Your withdrawal request has been rejected"`
- Body: Expense details + rejection reason + who rejected + "View Expense" button
- Tone: Neutral/informative

## UI Changes

### ApprovalStatusBadge
- Add `REJECTED` state: Red badge with XCircle icon, text "Rejected"
- Add `WITHDRAWAL_REJECTED` state: Red badge with XCircle icon, text "Withdrawal Rejected"

### EditExpenseSheet
- Add "Reject" button next to "Approve" button for expenses in `PENDING_APPROVAL`
- Add "Reject Withdrawal" button next to "Approve Withdrawal" for `WITHDRAWAL_REQUESTED`
- Both rejection buttons open an AlertDialog with a required reason textarea
- Show rejection reason and rejector name when expense is in rejected state

### New Components
- `RejectExpenseButton` — Button + AlertDialog with reason input, calls reject API
- `RejectWithdrawalButton` — Button + AlertDialog with reason input, calls reject-withdrawal API

## Non-Functional Requirements
- Email sending is fire-and-forget — failures are logged but don't block the API response
- All email functions return boolean success/failure for logging
- Email templates include plain text fallback
- Rejection reason is stored in the database for audit trail
